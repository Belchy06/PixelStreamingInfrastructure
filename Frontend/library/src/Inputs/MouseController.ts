import { MouseButtonsMask, MouseButton } from './MouseButtons';
import { StreamMessageController } from '../UeInstanceMessage/StreamMessageController';
import { CoordinateConverter } from '../Util/CoordinateConverter';
import { VideoPlayer } from '../VideoPlayer/VideoPlayer';
import type { ActiveKeys } from './InputClassesFactory';

/**
 * Extra types for Document and WheelEvent
 */
declare global {
    interface Document {
        mozPointerLockElement: unknown;
        mozExitPointerLock?(): void;
    }

    interface WheelEvent {
        wheelDelta: number;
    }
}

export class MouseController {
    videoPlayer: VideoPlayer;
    streamMessageController: StreamMessageController;
    coordinateConverter: CoordinateConverter;
    activeKeys: ActiveKeys;

    // bound listeners
    onEnterListener: (event: MouseEvent) => void;
    onLeaveListener: (event: MouseEvent) => void;

    constructor(
        streamMessageController: StreamMessageController,
        videoPlayer: VideoPlayer,
        coordinateConverter: CoordinateConverter,
        activeKeys: ActiveKeys
    ) {
        this.streamMessageController = streamMessageController;
        this.coordinateConverter = coordinateConverter;
        this.videoPlayer = videoPlayer;
        this.activeKeys = activeKeys;

        this.onEnterListener = this.onMouseEnter.bind(this);
        this.onLeaveListener = this.onMouseLeave.bind(this);
    }

    registerMouseEvents() {
        this.registerMouseEnterAndLeaveEvents();
    }

    unregisterMouseEvents() {
        this.unregisterMouseEnterAndLeaveEvents();
    }

    registerMouseEnterAndLeaveEvents() {
        const videoElementParent = this.videoPlayer.getVideoParentElement() as HTMLDivElement;
        videoElementParent.addEventListener('mouseenter', this.onEnterListener);
        videoElementParent.addEventListener('mouseleave', this.onLeaveListener);
    }

    unregisterMouseEnterAndLeaveEvents() {
        const videoElementParent = this.videoPlayer.getVideoParentElement() as HTMLDivElement;
        videoElementParent.removeEventListener('mouseenter', this.onEnterListener);
        videoElementParent.removeEventListener('mouseleave', this.onLeaveListener);
    }

    private onMouseEnter(event: MouseEvent) {
        if (!this.videoPlayer.isVideoReady()) {
            return;
        }
        this.streamMessageController.toStreamerHandlers.get('MouseEnter')();
        this.pressMouseButtons(event.buttons, event.x, event.y);
    }

    private onMouseLeave(event: MouseEvent) {
        if (!this.videoPlayer.isVideoReady()) {
            return;
        }
        this.streamMessageController.toStreamerHandlers.get('MouseLeave')();
        this.releaseMouseButtons(event.buttons, event.x, event.y);
    }

    private releaseMouseButtons(buttons: number, X: number, Y: number) {
        const coord = this.coordinateConverter.normalizeAndQuantizeUnsigned(X, Y);
        if (buttons & MouseButtonsMask.primaryButton) {
            this.sendMouseUp(MouseButton.mainButton, coord.x, coord.y);
        }
        if (buttons & MouseButtonsMask.secondaryButton) {
            this.sendMouseUp(MouseButton.secondaryButton, coord.x, coord.y);
        }
        if (buttons & MouseButtonsMask.auxiliaryButton) {
            this.sendMouseUp(MouseButton.auxiliaryButton, coord.x, coord.y);
        }
        if (buttons & MouseButtonsMask.fourthButton) {
            this.sendMouseUp(MouseButton.fourthButton, coord.x, coord.y);
        }
        if (buttons & MouseButtonsMask.fifthButton) {
            this.sendMouseUp(MouseButton.fifthButton, coord.x, coord.y);
        }
    }

    private pressMouseButtons(buttons: number, X: number, Y: number) {
        if (!this.videoPlayer.isVideoReady()) {
            return;
        }
        const coord = this.coordinateConverter.normalizeAndQuantizeUnsigned(X, Y);
        if (buttons & MouseButtonsMask.primaryButton) {
            this.sendMouseDown(MouseButton.mainButton, coord.x, coord.y);
        }
        if (buttons & MouseButtonsMask.secondaryButton) {
            this.sendMouseDown(MouseButton.secondaryButton, coord.x, coord.y);
        }
        if (buttons & MouseButtonsMask.auxiliaryButton) {
            this.sendMouseDown(MouseButton.auxiliaryButton, coord.x, coord.y);
        }
        if (buttons & MouseButtonsMask.fourthButton) {
            this.sendMouseDown(MouseButton.fourthButton, coord.x, coord.y);
        }
        if (buttons & MouseButtonsMask.fifthButton) {
            this.sendMouseDown(MouseButton.fifthButton, coord.x, coord.y);
        }
    }

    private sendMouseDown(button: number, X: number, Y: number) {
        this.streamMessageController.toStreamerHandlers.get('MouseDown')?.([button, X, Y]);
    }

    private sendMouseUp(button: number, X: number, Y: number) {
        const coord = this.coordinateConverter.normalizeAndQuantizeUnsigned(X, Y);
        this.streamMessageController.toStreamerHandlers.get('MouseUp')?.([button, coord.x, coord.y]);
    }
}

export class HoveringMouseController extends MouseController {
    videoElementParent: HTMLDivElement;

    onMouseUpListener: (event: MouseEvent) => void;
    onMouseDownListener: (event: MouseEvent) => void;
    onMouseDblClickListener: (event: MouseEvent) => void;
    onMouseWheelListener: (event: WheelEvent) => void;
    onMouseMoveListener: (event: MouseEvent) => void;
    onContextMenuListener: (event: MouseEvent) => void;

    constructor(
        streamMessageController: StreamMessageController,
        videoPlayer: VideoPlayer,
        coordinateConverter: CoordinateConverter,
        activeKeys: ActiveKeys
    ) {
        super(streamMessageController, videoPlayer, coordinateConverter, activeKeys);
        this.videoElementParent = videoPlayer.getVideoParentElement() as HTMLDivElement;
        this.onMouseUpListener = this.onMouseUp.bind(this);
        this.onMouseDownListener = this.onMouseDown.bind(this);
        this.onMouseDblClickListener = this.onMouseDblClick.bind(this);
        this.onMouseWheelListener = this.onMouseWheel.bind(this);
        this.onMouseMoveListener = this.onMouseMove.bind(this);
        this.onContextMenuListener = this.onContextMenu.bind(this);
    }

    registerMouseEvents(): void {
        super.registerMouseEvents();

        this.videoElementParent.addEventListener('mousemove', this.onMouseMoveListener);
        this.videoElementParent.addEventListener('mousedown', this.onMouseDownListener);
        this.videoElementParent.addEventListener('mouseup', this.onMouseUpListener);
        this.videoElementParent.addEventListener('contextmenu', this.onContextMenuListener);
        this.videoElementParent.addEventListener('wheel', this.onMouseWheelListener);
        this.videoElementParent.addEventListener('dblclick', this.onMouseDblClickListener);
    }

    unregisterMouseEvents(): void {
        this.videoElementParent.removeEventListener('mousemove', this.onMouseMoveListener);
        this.videoElementParent.removeEventListener('mousedown', this.onMouseDownListener);
        this.videoElementParent.removeEventListener('mouseup', this.onMouseUpListener);
        this.videoElementParent.removeEventListener('contextmenu', this.onContextMenuListener);
        this.videoElementParent.removeEventListener('wheel', this.onMouseWheelListener);
        this.videoElementParent.removeEventListener('dblclick', this.onMouseDblClickListener);

        super.unregisterMouseEvents();
    }

    private onMouseDown(event: MouseEvent) {
        if (!this.videoPlayer.isVideoReady()) {
            return;
        }
        const coord = this.coordinateConverter.normalizeAndQuantizeUnsigned(event.offsetX, event.offsetY);
        this.streamMessageController.toStreamerHandlers.get('MouseDown')([event.button, coord.x, coord.y]);
        event.preventDefault();
    }

    private onMouseUp(event: MouseEvent) {
        if (!this.videoPlayer.isVideoReady()) {
            return;
        }
        const coord = this.coordinateConverter.normalizeAndQuantizeUnsigned(event.offsetX, event.offsetY);
        this.streamMessageController.toStreamerHandlers.get('MouseUp')([event.button, coord.x, coord.y]);
        event.preventDefault();
    }

    private onContextMenu(event: MouseEvent) {
        if (!this.videoPlayer.isVideoReady()) {
            return;
        }
        event.preventDefault();
    }

    private onMouseMove(event: MouseEvent) {
        if (!this.videoPlayer.isVideoReady()) {
            return;
        }
        const coord = this.coordinateConverter.normalizeAndQuantizeUnsigned(event.offsetX, event.offsetY);
        const delta = this.coordinateConverter.normalizeAndQuantizeSigned(event.movementX, event.movementY);
        this.streamMessageController.toStreamerHandlers.get('MouseMove')([
            coord.x,
            coord.y,
            delta.x,
            delta.y
        ]);
        event.preventDefault();
    }

    private onMouseWheel(event: WheelEvent) {
        if (!this.videoPlayer.isVideoReady()) {
            return;
        }
        const coord = this.coordinateConverter.normalizeAndQuantizeUnsigned(event.offsetX, event.offsetY);
        this.streamMessageController.toStreamerHandlers.get('MouseWheel')([
            event.wheelDelta,
            coord.x,
            coord.y
        ]);
        event.preventDefault();
    }

    private onMouseDblClick(event: MouseEvent) {
        if (!this.videoPlayer.isVideoReady()) {
            return;
        }
        const coord = this.coordinateConverter.normalizeAndQuantizeUnsigned(event.offsetX, event.offsetY);
        this.streamMessageController.toStreamerHandlers.get('MouseDouble')([event.button, coord.x, coord.y]);
    }
}
