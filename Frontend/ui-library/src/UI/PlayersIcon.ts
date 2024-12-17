// Copyright Epic Games, Inc. All Rights Reserved.

/**
 * Players icon that can be clicked.
 */
export class PlayersIcon {
    _rootElement: HTMLButtonElement;
    _playersIcon: SVGElement;
    _tooltipText: HTMLElement;

    /**
     * Get the the button containing the players icon.
     */
    public get rootElement(): HTMLButtonElement {
        if (!this._rootElement) {
            this._rootElement = document.createElement('button');
            this._rootElement.type = 'button';
            this._rootElement.classList.add('UiTool');
            this._rootElement.id = 'playersBtn';
            this._rootElement.appendChild(this.playersIcon);
            this._rootElement.appendChild(this.tooltipText);
        }
        return this._rootElement;
    }

    public get tooltipText(): HTMLElement {
        if (!this._tooltipText) {
            this._tooltipText = document.createElement('span');
            this._tooltipText.classList.add('tooltiptext');
            this._tooltipText.innerHTML = 'Players';
        }
        return this._tooltipText;
    }

    public get playersIcon(): SVGElement {
        if (!this._playersIcon) {
            this._playersIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this._playersIcon.setAttributeNS(null, 'id', 'playersIcon');
            this._playersIcon.setAttributeNS(null, 'x', '0px');
            this._playersIcon.setAttributeNS(null, 'y', '0px');
            this._playersIcon.setAttributeNS(null, 'viewBox', '0 0 24 24');

            // create svg group for the paths
            const svgGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            svgGroup.classList.add('svgIcon');
            this._playersIcon.appendChild(svgGroup);

            // create path for the icon itself
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttributeNS(null, 'fill-rule', 'evenodd')
            path.setAttributeNS(
                null,
                'd',
                'M12 6a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm-1.5 8a4 4 0 0 0-4 4 2 2 0 0 0 2 2h7a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-3Zm6.82-3.096a5.51 5.51 0 0 0-2.797-6.293 3.5 3.5 0 1 1 2.796 6.292ZM19.5 18h.5a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-1.1a5.503 5.503 0 0 1-.471.762A5.998 5.998 0 0 1 19.5 18ZM4 7.5a3.5 3.5 0 0 1 5.477-2.889 5.5 5.5 0 0 0-2.796 6.293A3.501 3.501 0 0 1 4 7.5ZM7.1 12H6a4 4 0 0 0-4 4 2 2 0 0 0 2 2h.5a5.998 5.998 0 0 1 3.071-5.238A5.505 5.505 0 0 1 7.1 12Z'
            );
            path.setAttributeNS(null, 'clip-rule', 'evenodd')

            svgGroup.appendChild(path);
        }
        return this._playersIcon;
    }
}
