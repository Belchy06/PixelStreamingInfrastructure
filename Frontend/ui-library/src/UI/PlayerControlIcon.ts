// Copyright Epic Games, Inc. All Rights Reserved.

/**
 * Base class for an element (i.e. button) that, when clicked, will toggle mute the microphone to a pixel stream
 * Can be initialized with any HTMLElement, if it is set as rootElement in the constructor.
 */
export class PlayerControlIconBase {
    _rootElement: HTMLElement;

    public onToggled: () => void;

    public get rootElement() {
        return this._rootElement;
    }

    public set rootElement(element) {
        element.onclick = () => this.onToggled();
        this._rootElement = element;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {}
}

/**
 * An implementation of MicrophoneIconBase that uses an externally
 * provided HTMLElement for toggling full screen.
 */
export class PlayerControlIconExternal extends PlayerControlIconBase {
    constructor(externalButton: HTMLElement) {
        super();
        this.rootElement = externalButton;
    }
}

/**
 * Players icon that can be clicked.
 */
export class PlayerControlIcon extends PlayerControlIconBase {
    _controlIcon: SVGElement;

    constructor() {
        super();

        const root: HTMLButtonElement = document.createElement('button');
        root.type = 'button';
        root.classList.add('UiTool');
        root.id = 'playersBtn';
        root.style.borderRadius = '50%';
        root.style.width = '1.25rem';
        root.style.height = '1.25rem';
        root.style.padding = '0';
        root.appendChild(this.controlIcon);

        this.rootElement = root;
    }

    public get controlIcon(): SVGElement {
        if (!this._controlIcon) {
            this._controlIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this._controlIcon.setAttributeNS(null, 'id', 'controlIcon');
            this._controlIcon.setAttributeNS(null, 'x', '0px');
            this._controlIcon.setAttributeNS(null, 'y', '0px');
            this._controlIcon.setAttributeNS(null, 'viewBox', '0 0 16 16');

            // create svg group for the paths
            const svgGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            svgGroup.classList.add('svgIcon');
            this._controlIcon.appendChild(svgGroup);

            // create path for the icon itself
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttributeNS(
                null,
                'd',
                'M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z'
            );

            svgGroup.appendChild(path);
        }
        return this._controlIcon;
    }
}
