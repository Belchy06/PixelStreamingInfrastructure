/**
 * Base class for an element (i.e. button) that, when clicked, will toggle mute the microphone to a pixel stream
 * Can be initialized with any HTMLElement, if it is set as rootElement in the constructor.
 */
export class MicrophoneIconBase {
    isMute = false;

    _rootElement: HTMLElement;

    public onToggled: (muted: boolean) => void;

    public get rootElement() {
        return this._rootElement;
    }

    public set rootElement(element) {
        element.onclick = () => this.toggleMute();
        this._rootElement = element;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {}

    /**
     * Makes the document or VolumeElement Volume.
     */
    toggleMute() {
        this.onMuteChange();
    }

    /**
     * Handles the Volume button on change
     */
    onMuteChange() {
        this.isMute = !this.isMute;
        this.onToggled(this.isMute);
    }
}

/**
 * An implementation of MicrophoneIconBase that uses an externally
 * provided HTMLElement for toggling full screen.
 */
export class MicrophoneIconExternal extends MicrophoneIconBase {
    constructor(externalButton: HTMLElement) {
        super();
        this.rootElement = externalButton;
    }
}

/**
 * The default volume icon that contains a button and svgs for each state.
 */
export class MicrophoneIcon extends MicrophoneIconBase {
    _muteIcon: SVGElement;
    _unmuteIcon: SVGElement;
    _tooltipText: HTMLElement;

    constructor() {
        super();

        const createdButton: HTMLButtonElement = document.createElement('button');
        createdButton.type = 'button';
        createdButton.classList.add('UiTool');
        createdButton.id = 'microphone-btn';
        createdButton.appendChild(this.muteIcon);
        createdButton.appendChild(this.unmuteIcon);
        createdButton.appendChild(this.tooltipText);
        this.rootElement = createdButton;

        const unmute = this.unmuteIcon;
        const mute = this.muteIcon;

        if (this.isMute) {
            unmute.style.display = 'inline';
            //ios disappearing svg fix
            unmute.style.transform = 'translate(0, 0)';
            mute.style.display = 'none';
        } else {
            unmute.style.display = 'none';
            mute.style.display = 'inline';
            //ios disappearing svg fix
            mute.style.transform = 'translate(0, 0)';
        }
    }

    public get tooltipText(): HTMLElement {
        if (!this._tooltipText) {
            this._tooltipText = document.createElement('span');
            this._tooltipText.classList.add('tooltiptext');
        }

        this._tooltipText.innerHTML = this.isMute ? 'Unmute' : 'Mute';

        return this._tooltipText;
    }

    public get muteIcon(): SVGElement {
        if (!this._muteIcon) {
            this._muteIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this._muteIcon.setAttributeNS(null, 'id', 'muteIcon');
            this._muteIcon.setAttributeNS(null, 'x', '0px');
            this._muteIcon.setAttributeNS(null, 'y', '0px');
            this._muteIcon.setAttributeNS(null, 'viewBox', '0 0 512 512');

            // create svg group for the paths
            const svgGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            svgGroup.classList.add('svgIcon');
            this._muteIcon.appendChild(svgGroup);

            // create paths for the icon itself, one for each corner
            const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path1.setAttributeNS(
                null,
                'd',
                'M256,350.3c-52,0-94.3-42.3-94.3-94.3V94.3C161.7,42.3,204,0,256,0s94.3,42.3,94.3,94.3V256C350.3,308,308,350.3,256,350.3z M256,26.9c-37.1,0-67.4,30.2-67.4,67.4V256c0,37.1,30.2,67.4,67.4,67.4s67.4-30.2,67.4-67.4V94.3C323.4,57.2,293.1,26.9,256,26.9z'
            );

            const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path2.setAttributeNS(
                null,
                'd',
                'M431.2,256c0-7.4-6-13.5-13.5-13.5s-13.5,6-13.5,13.5c0,81.7-66.5,148.2-148.2,148.2S107.8,337.7,107.8,256c0-7.4-6-13.5-13.5-13.5s-13.5,6-13.5,13.5c0,92.1,71.4,167.8,161.7,174.6v54.4h-40.4c-7.4,0-13.5,6-13.5,13.5c0,7.4,6,13.5,13.5,13.5h107.8c7.4,0,13.5-6,13.5-13.5c0-7.4-6-13.5-13.5-13.5h-40.4v-54.4C359.8,423.8,431.2,348.1,431.2,256z'
            );

            svgGroup.appendChild(path1);
            svgGroup.appendChild(path2);
        }
        return this._muteIcon;
    }

    public get unmuteIcon(): SVGElement {
        if (!this._unmuteIcon) {
            this._unmuteIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this._unmuteIcon.setAttributeNS(null, 'id', 'unmuteIcon');
            this._unmuteIcon.setAttributeNS(null, 'x', '0px');
            this._unmuteIcon.setAttributeNS(null, 'y', '0px');
            this._unmuteIcon.setAttributeNS(null, 'viewBox', '0 0 512 512');

            // create svg group for the paths
            const svgGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            svgGroup.classList.add('svgIcon');
            this._unmuteIcon.appendChild(svgGroup);

            // create paths for the icon itself
            const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path1.setAttributeNS(null, 'style', 'fill-rule:evenodd;clip-rule:evenodd;');
            path1.setAttributeNS(
                null,
                'd',
                'M407.5,307.6c5.7-16.6,8.5-34.1,8.5-51.6v-32c0-8.8-7.2-16-16-16s-16,7.2-16,16v32c0,8.8-0.9,17.3-2.6,25.6L407.5,307.6z M326.8,362.7c-58.9,39.1-138.3,23-177.4-35.8c-13.9-21-21.4-45.6-21.4-70.8v-32c0-8.8-7.2-16-16-16s-16,7.2-16,16v32c0,82.2,62.2,151,144,159.2V480h-96c-8.8,0-16,7.2-16,16c0,8.9,7.2,16,16,16h224c8.8,0,16-7.1,16-16c0-8.8-7.2-16-16-16h-96v-64.8c28.1-2.8,54.9-13,77.7-29.5L326.8,362.7z M352,252.2V96.1c0-53-42.9-96-95.9-96.1c-41.2,0-77.8,26.2-91,65.2l27,27C194,57,224.2,30,259.5,31.9c34,1.9,60.6,30.1,60.5,64.2v124.1L352,252.2L352,252.2z M279.6,315.5l23.9,23.9c-46,26.3-104.7,10.2-130.9-35.8c-8.3-14.5-12.6-30.9-12.6-47.6v-60.1l32,32V256c0,35.3,28.6,64,64,64C264.1,320.1,272.1,318.5,279.6,315.5z M436.6,427.3l-384-384l22.7-22.6l384,384L436.6,427.3L436.6,427.3z'
            );

            svgGroup.appendChild(path1);
        }
        return this._unmuteIcon;
    }

    override onMuteChange() {
        super.onMuteChange();

        const unmute = this.unmuteIcon;
        const mute = this.muteIcon;
        this._tooltipText.innerHTML = this.isMute ? 'Unmute' : 'Mute';
        if (this.isMute) {
            unmute.style.display = 'inline';
            //ios disappearing svg fix
            unmute.style.transform = 'translate(0, 0)';
            mute.style.display = 'none';
        } else {
            unmute.style.display = 'none';
            mute.style.display = 'inline';
            //ios disappearing svg fix
            mute.style.transform = 'translate(0, 0)';
        }
    }
}
