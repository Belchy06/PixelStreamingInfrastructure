import { Logger } from '@epicgames-ps/lib-pixelstreamingcommon-ue5.5';
import { StreamMessageController } from '../UeInstanceMessage/StreamMessageController';
import { CoordinateConverter } from '../Util/CoordinateConverter';
import { VideoPlayer } from '../VideoPlayer/VideoPlayer';
import type { ActiveKeys } from './InputClassesFactory';
import { NormalizedQuantizedUnsignedCoord } from '../Util/CoordinateConverter';
import { MouseController } from './MouseController';

export class MouseControllerLocked extends MouseController {
    videoElementParent: HTMLDivElement;
    x: number;
    y: number;
    normalizedCoord: NormalizedQuantizedUnsignedCoord;

    // bound listeners
    onRequestLockListener: () => void;
    onLockStateChangeListener: () => void;
    onMouseUpListener: (event: MouseEvent) => void;
    onMouseDownListener: (event: MouseEvent) => void;
    onMouseDblClickListener: (event: MouseEvent) => void;
    onMouseWheelListener: (event: WheelEvent) => void;
    onMouseMoveListener: (event: MouseEvent) => void;

    constructor(
        streamMessageController: StreamMessageController,
        videoPlayer: VideoPlayer,
        coordinateConverter: CoordinateConverter,
        activeKeys: ActiveKeys
    ) {
        super(streamMessageController, videoPlayer, coordinateConverter, activeKeys);
        this.videoElementParent = videoPlayer.getVideoParentElement() as HTMLDivElement;
        this.x = this.videoElementParent.getBoundingClientRect().width / 2;
        this.y = this.videoElementParent.getBoundingClientRect().height / 2;
        this.normalizedCoord = this.coordinateConverter.normalizeAndQuantizeUnsigned(this.x, this.y);

        this.onRequestLockListener = this.onRequestLock.bind(this);
        this.onLockStateChangeListener = this.onLockStateChange.bind(this);
        this.onMouseUpListener = this.onMouseUp.bind(this);
        this.onMouseDownListener = this.onMouseDown.bind(this);
        this.onMouseDblClickListener = this.onMouseDblClick.bind(this);
        this.onMouseWheelListener = this.onMouseWheel.bind(this);
        this.onMouseMoveListener = this.onMouseMove.bind(this);
    }

    registerMouseEvents() {
        super.registerMouseEvents();

        this.videoElementParent.requestPointerLock =
            this.videoElementParent.requestPointerLock || this.videoElementParent.mozRequestPointerLock;
        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;

        if (this.videoElementParent.requestPointerLock) {
            this.videoElementParent.addEventListener('click', this.onRequestLockListener);
        }

        document.addEventListener('pointerlockchange', this.onLockStateChangeListener);
        document.addEventListener('mozpointerlockchange', this.onLockStateChangeListener);

        this.videoElementParent.addEventListener('mousedown', this.onMouseDownListener);
        this.videoElementParent.addEventListener('mouseup', this.onMouseUpListener);
        this.videoElementParent.addEventListener('wheel', this.onMouseWheelListener);
        this.videoElementParent.addEventListener('dblclick', this.onMouseDblClickListener);
    }

    unregisterMouseEvents() {
        const pointerLockElement = document.pointerLockElement || document.mozPointerLockElement;
        if (document.exitPointerLock && pointerLockElement === this.videoElementParent) {
            document.exitPointerLock();
        }

        this.videoElementParent.removeEventListener('click', this.onRequestLockListener);
        document.removeEventListener('pointerlockchange', this.onLockStateChangeListener);
        document.removeEventListener('mozpointerlockchange', this.onLockStateChangeListener);
        document.removeEventListener('mousemove', this.onMouseMoveListener);

        this.videoElementParent.removeEventListener('mousedown', this.onMouseDownListener);
        this.videoElementParent.removeEventListener('mouseup', this.onMouseUpListener);
        this.videoElementParent.removeEventListener('wheel', this.onMouseWheelListener);
        this.videoElementParent.removeEventListener('dblclick', this.onMouseDblClickListener);

        super.unregisterMouseEvents();
    }

    private onRequestLock() {
        this.videoElementParent.requestPointerLock();
    }

    private onLockStateChange() {
        const pointerLockElement = document.pointerLockElement || document.mozPointerLockElement;
        if (pointerLockElement === this.videoElementParent) {
            Logger.Info('Pointer locked');
            document.addEventListener('mousemove', this.onMouseMoveListener);
        } else {
            Logger.Info('The pointer lock status is now unlocked');
            document.removeEventListener('mousemove', this.onMouseMoveListener);

            // If mouse loses focus, send a key up for all of the currently held-down keys
            // This is necessary as when the mouse loses focus, the windows stops listening for events and as such
            // the keyup listener won't get fired
            const activeKeys = this.activeKeys.getActiveKeys();
            activeKeys.forEach((key: number) => {
                this.streamMessageController.toStreamerHandlers.get('KeyUp')([key]);
            });
        }
    }

    private onMouseDown(event: MouseEvent) {
        if (!this.videoPlayer.isVideoReady()) {
            return;
        }

        this.streamMessageController.toStreamerHandlers.get('MouseDown')([
            event.button,
            // We use the store value of this.coord as opposed to the mouseEvent.x/y as the mouseEvent location
            // uses the system cursor location which hasn't moved
            this.normalizedCoord.x,
            this.normalizedCoord.y
        ]);
    }

    private onMouseUp(event: MouseEvent) {
        if (!this.videoPlayer.isVideoReady()) {
            return;
        }
        this.streamMessageController.toStreamerHandlers.get('MouseUp')([
            event.button,
            // We use the store value of this.coord as opposed to the mouseEvent.x/y as the mouseEvent location
            // uses the system cursor location which hasn't moved
            this.normalizedCoord.x,
            this.normalizedCoord.y
        ]);
    }

    private onMouseMove(event: MouseEvent) {
        if (!this.videoPlayer.isVideoReady()) {
            return;
        }
        const styleWidth = this.videoPlayer.getVideoParentElement().clientWidth;
        const styleHeight = this.videoPlayer.getVideoParentElement().clientHeight;

        this.x += event.movementX;
        this.y += event.movementY;

        while (this.x > styleWidth) {
            this.x -= styleWidth;
        }
        while (this.y > styleHeight) {
            this.y -= styleHeight;
        }
        while (this.x < 0) {
            this.x += styleWidth;
        }
        while (this.y < 0) {
            this.y += styleHeight;
        }

        this.normalizedCoord = this.coordinateConverter.normalizeAndQuantizeUnsigned(this.x, this.y);
        const delta = this.coordinateConverter.normalizeAndQuantizeSigned(event.movementX, event.movementY);
        this.streamMessageController.toStreamerHandlers.get('MouseMove')([
            this.normalizedCoord.x,
            this.normalizedCoord.y,
            delta.x,
            delta.y
        ]);
    }

    private onMouseWheel(event: WheelEvent) {
        if (!this.videoPlayer.isVideoReady()) {
            return;
        }
        this.streamMessageController.toStreamerHandlers.get('MouseWheel')([
            event.wheelDelta,
            // We use the store value of this.coord as opposed to the mouseEvent.x/y as the mouseEvent location
            // uses the system cursor location which hasn't moved
            this.normalizedCoord.x,
            this.normalizedCoord.y
        ]);
    }

    private onMouseDblClick(event: MouseEvent) {
        if (!this.videoPlayer.isVideoReady()) {
            return;
        }
        this.streamMessageController.toStreamerHandlers.get('MouseDouble')([
            event.button,
            // We use the store value of this.coord as opposed to the mouseEvent.x/y as the mouseEvent location
            // uses the system cursor location which hasn't moved
            this.normalizedCoord.x,
            this.normalizedCoord.y
        ]);
    }
}
