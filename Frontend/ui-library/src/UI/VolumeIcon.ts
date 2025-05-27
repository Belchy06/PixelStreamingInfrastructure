// Copyright Epic Games, Inc. All Rights Reserved.

import { Logger } from "@epicgames-ps/lib-pixelstreamingfrontend-ue5.6";


export class VolumeIconBase {
    onVolumeChanged: ((value: number) => void);

    _rootElement: HTMLElement;
    _inputElement: HTMLInputElement;

    public get rootElement() {
        return this._rootElement;
    }

    public set rootElement(element) {
        this._rootElement = element;
    }

    public get inputElement() {
        return this._inputElement;
    }

    public set inputElement(element) {
        this._inputElement = element;

        this._inputElement.oninput = (ev: Event) => {
            const inputElem: HTMLInputElement = ev.target as HTMLInputElement;
            const parsedValue = Number.parseInt(inputElem.value);

            if (Number.isNaN(parsedValue)) {
                Logger.Warning(
                    `Could not parse value change into a valid number - value was ${inputElem.value}`
                );
            } else {
                this.onChanged(parsedValue);
            }
        }
    }

    onChanged(volume: number) {
        this.onVolumeChanged(volume);
    }
}

export class VolumeIconExternal extends VolumeIconBase {
    constructor(externalButton: HTMLElement) {
        super();
        this.rootElement = externalButton;
    }
}

/**
 * Speaker icon that can be clicked.
 */
export class VolumeIcon extends VolumeIconBase {
    _inputContainer: HTMLElement;

    _volumeMuteIcon: SVGElement;
    _volumeLowIcon: SVGElement;
    _volumeMediumIcon: SVGElement;
    _volumeHighIcon: SVGElement;

    constructor() {
        super();

        const volumeSlider = document.createElement('input');
        volumeSlider.type = 'range';
        volumeSlider.min = '0';
        volumeSlider.max = '100';
        volumeSlider.value = '100';
        volumeSlider.style.marginTop = '0.5rem';
        volumeSlider.style.pointerEvents = 'all';
        volumeSlider.onclick = (ev) => { ev.stopPropagation(); ev.preventDefault(); }

        this.inputElement = volumeSlider;

        const root = document.createElement('button');
        root.type = 'button';
        root.classList.add('UiTool');
        root.id = 'volumeBtn';
        root.appendChild(this.volumeMuteIcon);
        root.appendChild(this.volumeLowIcon);
        root.appendChild(this.volumeMediumIcon);
        root.appendChild(this.volumeHighIcon);
        root.appendChild(this.inputContainer);

        root.onclick = () => {
            this.onClicked();
        }

        this.rootElement = root;
    }

    public get inputContainer(): HTMLElement {
        if (!this._inputContainer) {
            this._inputContainer = document.createElement('div');
            this._inputContainer.classList.add('volumeControl');
            this._inputContainer.style.visibility = 'hidden';
            this._inputContainer.style.pointerEvents = 'none';
            this._inputContainer.appendChild(this.inputElement);
        }
        return this._inputContainer;
    }

    public get volumeMuteIcon(): SVGElement {
        if (!this._volumeMuteIcon) {
            this._volumeMuteIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this._volumeMuteIcon.setAttributeNS(null, 'id', 'volumeIcon');
            this._volumeMuteIcon.setAttributeNS(null, 'x', '0px');
            this._volumeMuteIcon.setAttributeNS(null, 'y', '0px');
            this._volumeMuteIcon.setAttributeNS(null, 'viewBox', '0 0 24 24');

            // create svg group for the paths
            const svgGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            svgGroup.classList.add('svgIcon');
            this._volumeMuteIcon.appendChild(svgGroup);

            // create paths for the icon itself, the inner and out path of a cog
            const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path1.setAttributeNS(
                null,
                'd',
                'M11.46 3c-1 0-1 .13-6.76 4H1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3.7l5.36 3.57A2.54 2.54 0 0 0 14 18.46V5.54A2.54 2.54 0 0 0 11.46 3zM2 9h2v6H2zm10 9.46a.55.55 0 0 1-.83.45L6 15.46V8.54l5.17-3.45a.55.55 0 0 1 .83.45zM21.41 12l2.3-2.29a1 1 0 0 0-1.42-1.42L20 10.59l-2.29-2.3a1 1 0 0 0-1.42 1.42l2.3 2.29-2.3 2.29a1 1 0 0 0 1.42 1.42l2.29-2.3 2.29 2.3a1 1 0 0 0 1.42-1.42z'
            );

            svgGroup.appendChild(path1);

            this._volumeMuteIcon.style.display = 'none';
        }

        return this._volumeMuteIcon;
    }

    public get volumeLowIcon(): SVGElement {
        if (!this._volumeLowIcon) {
            this._volumeLowIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this._volumeLowIcon.setAttributeNS(null, 'id', 'volumeIcon');
            this._volumeLowIcon.setAttributeNS(null, 'x', '0px');
            this._volumeLowIcon.setAttributeNS(null, 'y', '0px');
            this._volumeLowIcon.setAttributeNS(null, 'viewBox', '0 0 24 24');

            // create svg group for the paths
            const svgGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            svgGroup.classList.add('svgIcon');
            this._volumeLowIcon.appendChild(svgGroup);

            // create paths for the icon itself, the inner and out path of a cog
            const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path1.setAttributeNS(
                null,
                'd',
                'M11.46 3c-1 0-1 .13-6.76 4H1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3.7l5.36 3.57A2.54 2.54 0 0 0 14 18.46V5.54A2.54 2.54 0 0 0 11.46 3zM2 9h2v6H2zm10 9.46a.55.55 0 0 1-.83.45L6 15.46V8.54l5.17-3.45a.55.55 0 0 1 .83.45zM16.83 9.17a1 1 0 0 0-1.42 1.42 2 2 0 0 1 0 2.82 1 1 0 0 0 .71 1.71c1.38 0 3.04-3.62.71-5.95z'
            );

            svgGroup.appendChild(path1);

            this._volumeLowIcon.style.display = 'none';
        }
        return this._volumeLowIcon;
    }

    public get volumeMediumIcon(): SVGElement {
        if (!this._volumeMediumIcon) {
            this._volumeMediumIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this._volumeMediumIcon.setAttributeNS(null, 'id', 'volumeIcon');
            this._volumeMediumIcon.setAttributeNS(null, 'x', '0px');
            this._volumeMediumIcon.setAttributeNS(null, 'y', '0px');
            this._volumeMediumIcon.setAttributeNS(null, 'viewBox', '0 0 24 24');

            // create svg group for the paths
            const svgGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            svgGroup.classList.add('svgIcon');
            this._volumeMediumIcon.appendChild(svgGroup);
            // create paths for the icon itself, the inner and out path of a cog
            const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path1.setAttributeNS(
                null,
                'd',
                'M11.46 3c-1 0-1 .13-6.76 4H1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3.7l5.36 3.57A2.54 2.54 0 0 0 14 18.46V5.54A2.54 2.54 0 0 0 11.46 3zM2 9h2v6H2zm10 9.46a.55.55 0 0 1-.83.45L6 15.46V8.54l5.17-3.45a.55.55 0 0 1 .83.45zM16.83 9.17a1 1 0 0 0-1.42 1.42 2 2 0 0 1 0 2.82 1 1 0 0 0 .71 1.71c1.38 0 3.04-3.62.71-5.95z'
            );

            const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path2.setAttributeNS(
                null,
                'd',
                'M19 7.05a1 1 0 0 0-1.41 1.41 5 5 0 0 1 0 7.08 1 1 0 0 0 .7 1.7c1.61 0 4.8-6.05.71-10.19z'
            );

            svgGroup.appendChild(path1);
            svgGroup.appendChild(path2);

            this._volumeMediumIcon.style.display = 'none';
        }
        return this._volumeMediumIcon;
    }

    public get volumeHighIcon(): SVGElement {
        if (!this._volumeHighIcon) {
            this._volumeHighIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this._volumeHighIcon.setAttributeNS(null, 'id', 'volumeIcon');
            this._volumeHighIcon.setAttributeNS(null, 'x', '0px');
            this._volumeHighIcon.setAttributeNS(null, 'y', '0px');
            this._volumeHighIcon.setAttributeNS(null, 'viewBox', '0 0 24 24');

            // create svg group for the paths
            const svgGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            svgGroup.classList.add('svgIcon');
            this._volumeHighIcon.appendChild(svgGroup);

            // create paths for the icon itself, the inner and out path of a cog
            const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path1.setAttributeNS(
                null,
                'd',
                'M11.46 3c-1 0-1 .13-6.76 4H1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3.7l5.36 3.57A2.54 2.54 0 0 0 14 18.46V5.54A2.54 2.54 0 0 0 11.46 3zM2 9h2v6H2zm10 9.46a.55.55 0 0 1-.83.45L6 15.46V8.54l5.17-3.45a.55.55 0 0 1 .83.45zM16.83 9.17a1 1 0 0 0-1.42 1.42 2 2 0 0 1 0 2.82 1 1 0 0 0 .71 1.71c1.38 0 3.04-3.62.71-5.95z'
            );

            const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path2.setAttributeNS(
                null,
                'd',
                'M19 7.05a1 1 0 0 0-1.41 1.41 5 5 0 0 1 0 7.08 1 1 0 0 0 .7 1.7c1.61 0 4.8-6.05.71-10.19z'
            );

            const path3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path3.setAttributeNS(
                null,
                'd',
                'M21.07 4.93a1 1 0 0 0-1.41 1.41 8 8 0 0 1 0 11.32 1 1 0 0 0 1.41 1.41 10 10 0 0 0 0-14.14z'
            );

            svgGroup.appendChild(path1);
            svgGroup.appendChild(path2);
            svgGroup.appendChild(path3);

            this._volumeHighIcon.style.display = 'inline';
            this._volumeHighIcon.style.transform = 'translate(0, 0)';
        }
        return this._volumeHighIcon;
    }

    private onClicked() {
        if (this.inputContainer.style.visibility === 'hidden') {
            this.inputContainer.style.visibility = 'visible'
        }
        else {
            this.inputContainer.style.visibility = 'hidden'
        }
    }

    override onChanged(volume: number) {
        super.onChanged(volume);

        if (volume === 0) {
            this.volumeMuteIcon.style.display = 'inline';
            //ios disappearing svg fix
            this.volumeMuteIcon.style.transform = 'translate(0, 0)';

            this.volumeLowIcon.style.display = 'none';
            this.volumeMediumIcon.style.display = 'none';
            this.volumeHighIcon.style.display = 'none';

        }
        else if (volume < 33) {
            this.volumeLowIcon.style.display = 'inline';
            //ios disappearing svg fix
            this.volumeLowIcon.style.transform = 'translate(0, 0)';

            this.volumeMuteIcon.style.display = 'none';
            this.volumeMediumIcon.style.display = 'none';
            this.volumeHighIcon.style.display = 'none';

        }
        else if (volume < 66) {
            this.volumeMediumIcon.style.display = 'inline';
            //ios disappearing svg fix
            this.volumeMediumIcon.style.transform = 'translate(0, 0)';

            this.volumeMuteIcon.style.display = 'none';
            this.volumeLowIcon.style.display = 'none';
            this.volumeHighIcon.style.display = 'none';
        }
        else {
            this.volumeHighIcon.style.display = 'inline';
            //ios disappearing svg fix
            this.volumeHighIcon.style.transform = 'translate(0, 0)';

            this.volumeMuteIcon.style.display = 'none';
            this.volumeLowIcon.style.display = 'none';
            this.volumeMediumIcon.style.display = 'none';
        }
    }
}
