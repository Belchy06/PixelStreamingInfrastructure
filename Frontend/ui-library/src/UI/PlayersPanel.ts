// Copyright Epic Games, Inc. All Rights Reserved.

import { Button } from './Button';
import { Slider } from './Slider';
import {
    isPlayerControlEnabled,
    PlayerControls,
    PlayerControlsConfiguration,
    PlayersPanelConfiguration,
    UIElementCreationMode
} from './UIConfigurationTypes';
import { PlayerControlIcon, PlayerControlIconBase, PlayerControlIconExternal } from './PlayerControlIcon';

class PlayerLabel {
    _rootElement: HTMLElement;
    _crownIcon: SVGElement;
    _mutedIcon: SVGElement;
    _deafenedIcon: SVGElement;

    _id: string;
    _isControllingInput: boolean;
    _isThisPlayer: boolean;
    _isMuted: boolean;
    _isDeafened: boolean;
    _isActive: boolean;

    label(): string {
        // Only shown the crown for this player
        const crownString = `${this._isControllingInput ? `${this.crownIcon.outerHTML} ` : ''}`;
        const idString = `${this._id} `;
        const isThisPlayerString = `${this._isThisPlayer ? '(you) ' : ''}`;
        const isMutedString = `${this._isMuted ? `${this.mutedIcon.outerHTML} ` : ''}`;
        const isDeafenedString = `${this._isDeafened ? `${this.deafenedIcon.outerHTML} ` : ''}`;
        return crownString + idString + isThisPlayerString + isMutedString + isDeafenedString;
    }

    public get rootElement(): HTMLElement {
        if (!this._rootElement) {
            this._rootElement = document.createElement('div');
            this._rootElement.classList.add('playerLabel');
        }
        return this._rootElement;
    }

    public get mutedIcon(): SVGElement {
        if (!this._mutedIcon) {
            this._mutedIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this._mutedIcon.setAttributeNS(null, 'id', 'unmuteIcon');
            this._mutedIcon.setAttributeNS(null, 'x', '0px');
            this._mutedIcon.setAttributeNS(null, 'y', '0px');
            this._mutedIcon.setAttributeNS(null, 'viewBox', '0 0 512 512');

            // create svg group for the paths
            const svgGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            svgGroup.classList.add('svgIcon');
            this._mutedIcon.appendChild(svgGroup);

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
        return this._mutedIcon;
    }

    public get crownIcon(): SVGElement {
        if (!this._crownIcon) {
            this._crownIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this._crownIcon.setAttributeNS(null, 'id', 'crownIcon');
            this._crownIcon.setAttributeNS(null, 'x', '0px');
            this._crownIcon.setAttributeNS(null, 'y', '0px');
            this._crownIcon.setAttributeNS(null, 'viewBox', '0 0 128 128');

            // create svg group for the paths
            const svgGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            svgGroup.classList.add('svgIcon');
            this._crownIcon.appendChild(svgGroup);

            // create paths for the icon itself
            const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path1.setAttributeNS(
                null,
                'd',
                'M128 53.279c0 5.043-4.084 9.136-9.117 9.136-.091 0-.164 0-.255-.018l-8.914 34.06H18.286L8.734 65.01C3.884 64.81 0 60.808 0 55.892c0-5.043 4.084-9.136 9.117-9.136 5.032 0 9.117 4.093 9.117 9.136a9.557 9.557 0 0 1-.492 2.997l22.081 12.919 18.671-34.371a9.1 9.1 0 0 1-4.267-7.729c0-5.043 4.084-9.136 9.117-9.136s9.117 4.093 9.117 9.136a9.1 9.1 0 0 1-4.267 7.729l18.671 34.371 24.05-14.07a9.164 9.164 0 0 1-1.149-4.459c0-5.062 4.084-9.136 9.117-9.136 5.033 0 9.117 4.075 9.117 9.136zm-18.286 46.835H18.286v7.314h91.429v-7.314z'
            );

            svgGroup.appendChild(path1);
        }
        return this._crownIcon;
    }

    public get deafenedIcon(): SVGElement {
        if (!this._deafenedIcon) {
            this._deafenedIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this._deafenedIcon.setAttributeNS(null, 'id', 'deafenedIcon');
            this._deafenedIcon.setAttributeNS(null, 'x', '0px');
            this._deafenedIcon.setAttributeNS(null, 'y', '0px');
            this._deafenedIcon.setAttributeNS(null, 'viewBox', '0 0 24 24');

            // create svg group for the paths
            const svgGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            svgGroup.classList.add('svgIcon');
            this._deafenedIcon.appendChild(svgGroup);

            // create paths for the icon itself
            const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path1.setAttributeNS(
                null,
                'd',
                'M22 17.0208V13.0416L21.9756 12.6779C21.8604 10.9593 21.3378 9.34752 20.4999 7.9502M15.5896 17.8012C15.4203 16.9103 15.4203 15.9944 15.5896 15.1035C15.8616 13.6716 16.8981 12.5183 18.2698 12.121L18.5607 12.0367C18.8632 11.9491 19.176 11.9047 19.4903 11.9047C20.8764 11.9047 22 13.0544 22 14.4727V18.432C22 19.8503 20.8764 21 19.4903 21C19.176 21 18.8632 20.9556 18.5607 20.868L18.2698 20.7837C16.8981 20.3865 15.8616 19.2331 15.5896 17.8012Z'
            );
            path1.setAttributeNS(null, 'stroke-linecap', 'round');
            path1.setAttributeNS(null, 'stroke-width', '1.5');

            const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path2.setAttributeNS(
                null,
                'd',
                'M1.24997 17.0208C1.24997 17.435 1.58576 17.7708 1.99997 17.7708C2.41419 17.7708 2.74997 17.435 2.74997 17.0208H1.24997ZM1.99997 13.0416L1.25165 12.9914L1.24997 13.0165V13.0416H1.99997ZM2.02435 12.678L2.77267 12.7281L2.02435 12.678ZM10.1659 3.18694L10.3171 3.92154L10.1659 3.18694ZM13.8341 3.18694L13.6829 3.92154L13.8341 3.18694ZM5.73018 12.121L5.93882 11.4006L5.93881 11.4006L5.73018 12.121ZM5.43922 12.0367L5.23058 12.7571H5.23058L5.43922 12.0367ZM1.99998 14.4727H2.74998V14.4727L1.99998 14.4727ZM1.99998 18.4321L2.74998 18.4321V18.4321H1.99998ZM3.02145 20.5L2.56964 21.0987L2.77022 21.2501L3.02151 21.25L3.02145 20.5ZM18.2698 5.3353L18.8001 4.80497L18.7768 4.78163L18.7515 4.76043L18.2698 5.3353ZM22.5303 2.53033C22.8232 2.23744 22.8232 1.76256 22.5303 1.46967C22.2374 1.17678 21.7625 1.17678 21.4696 1.46967L22.5303 2.53033ZM1.46961 21.4697C1.17672 21.7626 1.17672 22.2374 1.46961 22.5303C1.7625 22.8232 2.23738 22.8232 2.53027 22.5303L1.46961 21.4697ZM18.4672 5.53274L18.9975 6.06307L18.4672 5.53274ZM8.29056 14.6328L9.00459 14.4033L8.29056 14.6328ZM2.74997 17.0208V13.0416H1.24997V17.0208H2.74997ZM2.74829 13.0918L2.77267 12.7281L1.27603 12.6278L1.25165 12.9914L2.74829 13.0918ZM10.3171 3.92154C11.4279 3.69287 12.572 3.69287 13.6829 3.92154L13.9853 2.45234C12.6749 2.1826 11.325 2.1826 10.0147 2.45234L10.3171 3.92154ZM2.77267 12.7281C3.06449 8.37463 6.16363 4.77651 10.3171 3.92154L10.0147 2.45234C5.18025 3.44749 1.61154 7.62249 1.27603 12.6278L2.77267 12.7281ZM5.93881 11.4006L5.64785 11.3163L5.23058 12.7571L5.52154 12.8414L5.93881 11.4006ZM5.64786 11.3163C5.27774 11.2092 4.89469 11.1547 4.50966 11.1547V12.6547C4.75325 12.6547 4.99583 12.6891 5.23058 12.7571L5.64786 11.3163ZM4.50966 11.1547C2.69324 11.1547 1.24997 12.6566 1.24998 14.4727L2.74998 14.4727C2.74997 13.4523 3.55395 12.6547 4.50966 12.6547V11.1547ZM5.52154 12.8414C6.49232 13.1226 7.26146 13.8819 7.57652 14.8623L9.00459 14.4033C8.54165 12.9628 7.40367 11.8249 5.93882 11.4006L5.52154 12.8414ZM1.24998 14.4727L1.24998 18.4321H2.74998L2.74998 14.4727H1.24998ZM3.47326 19.9014C3.03674 19.5719 2.74997 19.0391 2.74998 18.4321L1.24998 18.4321C1.24997 19.5214 1.767 20.4929 2.56964 21.0987L3.47326 19.9014ZM18.7515 4.76043C17.4047 3.63198 15.7815 2.82209 13.9853 2.45234L13.6829 3.92154C15.2282 4.23963 16.6258 4.93628 17.7881 5.91016L18.7515 4.76043ZM7.88005 15.0592L2.96961 19.9697L4.03027 21.0303L8.94071 16.1199L7.88005 15.0592ZM2.96961 19.9697L1.46961 21.4697L2.53027 22.5303L4.03027 21.0303L2.96961 19.9697ZM3.02151 21.25L3.5 21.25L3.49988 19.75L3.02139 19.75L3.02151 21.25ZM21.4696 1.46967L17.9369 5.00241L18.9975 6.06307L22.5303 2.53033L21.4696 1.46967ZM17.9369 5.00241L7.88005 15.0592L8.94071 16.1199L18.9975 6.06307L17.9369 5.00241ZM17.7394 5.86563L17.9369 6.06307L18.9975 5.00241L18.8001 4.80497L17.7394 5.86563ZM7.57652 14.8623C7.63941 15.058 7.66038 15.2906 7.66038 15.5896H9.16038C9.16038 15.242 9.13952 14.8232 9.00459 14.4033L7.57652 14.8623Z'
            );

            svgGroup.appendChild(path1);
            svgGroup.appendChild(path2);
        }
        return this._deafenedIcon;
    }

    public set id(id: string) {
        this._id = id;
        this.rootElement.innerHTML = this.label();
    }

    public set isControllingInput(isControllingInput: boolean) {
        this._isControllingInput = isControllingInput;
        this.rootElement.innerHTML = this.label();
    }

    public set isThisPlayer(isThisPlayer: boolean) {
        this._isThisPlayer = isThisPlayer;
        this.rootElement.innerHTML = this.label();
    }

    public set isMuted(isMuted: boolean) {
        this._isMuted = isMuted;
        this.rootElement.innerHTML = this.label();
    }

    public set isDeafened(isDeafened: boolean) {
        this._isDeafened = isDeafened;
        this.rootElement.innerHTML = this.label();
    }

    public set isActive(isActive: boolean) {
        this._isActive = isActive;
        if (isActive) {
            this.rootElement.classList.add('isSpeaking');
        } else {
            this.rootElement.classList.remove('isSpeaking');
        }
    }
}

export class PlayerEntry {
    _config: PlayerControlsConfiguration;
    _label: PlayerLabel;
    _isThisPlayer: boolean;
    _rootElement: HTMLElement; // The root element for this player entry
    _playerElement: HTMLElement; // The player element for this entry. Holds the player name and "control" icon (ie the icon to open the controls)
    _controlsElement: HTMLElement; // The element responsible for holding all the controls

    // Control to mute another player
    _muteButton: Button;
    // Control to session mute another player
    _globalMuteButton: Button;

    _onMuteListener: (mute: boolean, isGlobal: boolean) => void;

    // Control to deafen a player
    _deafenButton: Button;
    // Control to session deafen another player
    _globalDeafenButton: Button;

    _onDeafenListener: (deafen: boolean, isGlobal: boolean) => void;

    // Control to kick another player
    _kickButton: Button;
    _onKickListener: () => void;

    // Control to assign input controller to another player
    _controlsInputButton: Button;
    _onControlsInputListener: () => void;

    // Control to either control this users microphone volume or change another users volume
    _volumeSlider: Slider;
    _onVolumeSliderListener: (value: number) => void;

    // The icon next to a players label to open/close the player controls
    _controlsIcon: PlayerControlIconBase;

    constructor(
        config: PlayerControlsConfiguration,
        label: string,
        isThisPlayer: boolean,
        onMuteListener: (mute: boolean, isGlobal: boolean) => void,
        onKickListener: () => void,
        onDeafenListener: (deafen: boolean, isGlobal: boolean) => void,
        onControlsInputListener: () => void,
        onVolumeSliderListener: (value: number) => void
    ) {
        this._config = config;
        this._isThisPlayer = isThisPlayer;
        this._label = new PlayerLabel();
        this._label.id = label;
        this._label.isThisPlayer = isThisPlayer;
        this._onMuteListener = onMuteListener;
        this._onKickListener = onKickListener;
        this._onDeafenListener = onDeafenListener;
        this._onControlsInputListener = onControlsInputListener;
        this._onVolumeSliderListener = onVolumeSliderListener;

        this._controlsIcon =
            // Depending on if we're creating an internal button, or using an external one
            this._config &&
            !!this._config.controlButtonConfig &&
            this._config.controlButtonConfig.creationMode === UIElementCreationMode.UseCustomElement
                ? // Either create a fullscreen class based on the external button
                  new PlayerControlIconExternal(this._config.controlButtonConfig.customElement)
                : // Or use the default icon
                  new PlayerControlIcon();

        this._controlsIcon.onToggled = () => {
            if (this.controlsElement.style.display == 'none') {
                this.controlsElement.style.display = 'block';
            } else {
                this.controlsElement.style.display = 'none';
            }
        };
    }

    get kickButton(): Button {
        if (!this._kickButton) {
            this._kickButton = new Button('Kick');
            this._kickButton.addOnClickListener(this._onKickListener);
        }
        return this._kickButton;
    }

    get muteButton(): Button {
        if (!this._muteButton) {
            this._muteButton = new Button('Mute');
            this._muteButton.addOnClickListener(() => {
                this._onMuteListener(this._muteButton.button.value === 'Mute' ? true : false, false);
            });
        }
        return this._muteButton;
    }

    get deafenButton(): Button {
        if (!this._deafenButton) {
            this._deafenButton = new Button('Deafen');
            this._deafenButton.addOnClickListener(() => {
                this._onDeafenListener(this._deafenButton.button.value === 'Deafen' ? true : false, false);
            });
        }
        return this._deafenButton;
    }

    get controlsInputButton(): Button {
        if (!this._controlsInputButton) {
            this._controlsInputButton = new Button('Give input control');
            this._controlsInputButton.addOnClickListener(this._onControlsInputListener);
        }
        return this._controlsInputButton;
    }

    get volumeSlider(): Slider {
        if (!this._volumeSlider) {
            this._volumeSlider = new Slider(
                `${this._isThisPlayer ? 'Microphone Volume' : 'User Volume'}: 100%`
            );
            this._volumeSlider.addOnChangeListener((value: number) => {
                this._volumeSlider.label.innerHTML = `${this._isThisPlayer ? 'Microphone Volume' : 'User Volume'}: ${value}%`;
            });
            this._volumeSlider.addOnChangeListener(this._onVolumeSliderListener);
            this._volumeSlider.slider.min = '0';
            this._volumeSlider.slider.max = '200';
            this._volumeSlider.slider.value = '100';
        }
        return this._volumeSlider;
    }

    get globalMuteButton(): Button {
        if (!this._globalMuteButton) {
            this._globalMuteButton = new Button('Global Mute');
            this._globalMuteButton.button.classList.add('danger');
            this._globalMuteButton.addOnClickListener(() => {
                this._onMuteListener(
                    this._globalMuteButton.button.value === 'Global Mute' ? true : false,
                    true
                );
            });
        }
        return this._globalMuteButton;
    }

    get globalDeafenButton(): Button {
        if (!this._globalDeafenButton) {
            this._globalDeafenButton = new Button('Global Deafen');
            this._globalDeafenButton.button.classList.add('danger');
            this._globalDeafenButton.addOnClickListener(() => {
                this._onDeafenListener(
                    this._globalDeafenButton.button.value === 'Global Deafen' ? true : false,
                    true
                );
            });
        }
        return this._globalDeafenButton;
    }

    get controlsElement(): HTMLElement {
        if (!this._controlsElement) {
            this._controlsElement = document.createElement('div');
            this._controlsElement.id = 'playerControls';
            this._controlsElement.style.display = 'none';

            const volumeSlider = this.volumeSlider;
            if (isPlayerControlEnabled(this._config, PlayerControls.Volume)) {
                this._controlsElement.appendChild(volumeSlider.rootElement);
            }

            // We only want users to be able to mute other users individually. They mute themself using the microphone icon
            const muteButton = this.muteButton;
            if (isPlayerControlEnabled(this._config, PlayerControls.Mute) && !this._isThisPlayer) {
                this._controlsElement.appendChild(muteButton.rootElement);
            }

            // Users should only be able to deafen themself
            const deafenButton = this.deafenButton;
            if (isPlayerControlEnabled(this._config, PlayerControls.Deafen) && this._isThisPlayer) {
                this._controlsElement.appendChild(deafenButton.rootElement);
            }

            // Users should only be able to kick other players
            const kickButton = this.kickButton;
            if (isPlayerControlEnabled(this._config, PlayerControls.Kick) && !this._isThisPlayer) {
                this._controlsElement.appendChild(kickButton.rootElement);
            }

            // Users should only be able to assign input control to other players
            const controlsInputButton = this.controlsInputButton;
            if (
                isPlayerControlEnabled(this._config, PlayerControls.SetInputController) &&
                !this._isThisPlayer
            ) {
                this._controlsElement.appendChild(controlsInputButton.rootElement);
            }

            const globalMuteButton = this.globalMuteButton;
            if (isPlayerControlEnabled(this._config, PlayerControls.GlobalMute)) {
                this._controlsElement.appendChild(globalMuteButton.rootElement);
            }

            const globalDeafenButton = this.globalDeafenButton;
            if (isPlayerControlEnabled(this._config, PlayerControls.GlobalDeafen)) {
                this._controlsElement.appendChild(globalDeafenButton.rootElement);
            }
        }
        return this._controlsElement;
    }

    public get playerElement(): HTMLElement {
        if (!this._playerElement) {
            this._playerElement = document.createElement('div');
            this._playerElement.classList.add('setting');

            this._playerElement.appendChild(this._label.rootElement);
            this._playerElement.appendChild(this._controlsIcon.rootElement);
        }
        return this._playerElement;
    }

    public get rootElement(): HTMLElement {
        if (!this._rootElement) {
            // create root div with "setting" css class
            this._rootElement = document.createElement('div');
            this._rootElement.id = 'playerEntry';
            this._rootElement.appendChild(this.playerElement);
            this._rootElement.appendChild(this.controlsElement);
        }
        return this._rootElement;
    }

    public updateControls(controlsInput: boolean) {
        if (isPlayerControlEnabled(this._config, PlayerControls.Kick) && !this._isThisPlayer) {
            controlsInput
                ? this.controlsElement.appendChild(this.kickButton.rootElement)
                : this.controlsElement.removeChild(this.kickButton.rootElement);
        }
        if (isPlayerControlEnabled(this._config, PlayerControls.SetInputController) && !this._isThisPlayer) {
            controlsInput
                ? this.controlsElement.appendChild(this.controlsInputButton.rootElement)
                : this.controlsElement.removeChild(this.controlsInputButton.rootElement);
        }
        if (isPlayerControlEnabled(this._config, PlayerControls.GlobalMute)) {
            controlsInput
                ? this.controlsElement.appendChild(this.globalMuteButton.rootElement)
                : this.controlsElement.removeChild(this.globalMuteButton.rootElement);
        }
        if (isPlayerControlEnabled(this._config, PlayerControls.GlobalDeafen)) {
            controlsInput
                ? this.controlsElement.appendChild(this.globalDeafenButton.rootElement)
                : this.controlsElement.removeChild(this.globalDeafenButton.rootElement);
        }
    }
}

/**
 * A UI component containing all the players for the application.
 */
export class PlayersPanel {
    _rootElement: HTMLElement;
    _playersCloseButton: HTMLElement;
    _playersContentElement: HTMLElement;
    _playerList: HTMLElement;
    _controlsInput: boolean;
    _config: PlayersPanelConfiguration;

    /* A map of players we are storing/rendering */
    _playersMap = new Map<string, PlayerEntry>();
    onMuteListener: (playerId: string, mute: boolean, isGlobal: boolean) => void;
    onKickListener: (playerId: string) => void;
    onDeafenListener: (playerId: string, deafen: boolean, isGlobal: boolean) => void;
    onControlsInputListener: (playerId: string) => void;
    onVolumeSliderListener: (playerId: string, value: number) => void;

    constructor(config: PlayersPanelConfiguration) {
        this._config = config;
        this._rootElement = null;
        this._controlsInput = true;
    }

    /**
     * @returns Return or creates a HTML element that represents this setting in the DOM.
     */
    public get rootElement(): HTMLElement {
        if (!this._rootElement) {
            this._rootElement = document.createElement('div');
            this._rootElement.id = 'players-panel';
            this._rootElement.classList.add('panel-wrap');

            const panelElem = document.createElement('div');
            panelElem.classList.add('panel');
            this._rootElement.appendChild(panelElem);

            const playersHeading = document.createElement('div');
            playersHeading.id = 'playersHeading';
            playersHeading.textContent = 'Players';
            panelElem.appendChild(playersHeading);

            panelElem.appendChild(this.playersCloseButton);
            panelElem.appendChild(this.playersContentElement);
        }
        return this._rootElement;
    }

    public get playersContentElement(): HTMLElement {
        if (!this._playersContentElement) {
            this._playersContentElement = document.createElement('div');
            this._playersContentElement.id = 'playersContent';

            this._playersContentElement.appendChild(this.playerList);
        }
        return this._playersContentElement;
    }

    public get playersCloseButton(): HTMLElement {
        if (!this._playersCloseButton) {
            this._playersCloseButton = document.createElement('div');
            this._playersCloseButton.id = 'playersClose';
        }
        return this._playersCloseButton;
    }

    public get playerList(): HTMLElement {
        if (!this._playerList) {
            this._playerList = document.createElement('div');
            this._playerList.id = 'playerList';
        }
        return this._playerList;
    }

    /**
     * Show players panel.
     */
    public show(): void {
        if (!this.rootElement.classList.contains('panel-wrap-visible')) {
            this.rootElement.classList.add('panel-wrap-visible');
        }
    }

    /**
     * Toggle the visibility of the players panel.
     */
    public toggleVisibility(): void {
        this.rootElement.classList.toggle('panel-wrap-visible');
    }

    /**
     * Hide players panel.
     */
    public hide(): void {
        if (this.rootElement.classList.contains('panel-wrap-visible')) {
            this.rootElement.classList.remove('panel-wrap-visible');
        }
    }

    public handlePlayerList(playerListJson: string, thisPlayerId: string): void {
        // Remove players that have disconnected
        const json = JSON.parse(playerListJson);
        delete json.Type;

        const playerIds = Object.keys(json);

        const removedPlayerIds: string[] = [];
        this._playersMap.forEach((_control: PlayerEntry, id: string) => {
            if (!playerIds.includes(id)) {
                removedPlayerIds.push(id);
            }
        });

        removedPlayerIds.forEach((removedPlayerId: string) => {
            const removedPlayer = this._playersMap.get(removedPlayerId);
            this.playerList.removeChild(removedPlayer.rootElement);
            this._playersMap.delete(removedPlayerId);
        });

        playerIds.sort(function (x, y) {
            return x == thisPlayerId ? -1 : y == thisPlayerId ? 1 : 0;
        });
        playerIds.forEach((playerId: string) => {
            if (!this._playersMap.has(playerId)) {
                const playerControl = new PlayerEntry(
                    this._config,
                    playerId,
                    playerId === thisPlayerId,
                    (mute: boolean, isGlobal: boolean) => this.onMuteListener(playerId, mute, isGlobal),
                    () => this.onKickListener(playerId),
                    (deafen: boolean, isGlobal: boolean) => this.onDeafenListener(playerId, deafen, isGlobal),
                    () => this.onControlsInputListener(playerId),
                    (value: number) => this.onVolumeSliderListener(playerId, value)
                );
                this.playerList.appendChild(playerControl.rootElement);
                playerControl.updateControls(this._controlsInput);

                this._playersMap.set(playerId, playerControl);
            }

            const playerControl = this._playersMap.get(playerId);
            const playerListEntry = json[playerId];

            this.handlePlayerMuteState(
                playerId,
                playerListEntry['MuteState']['State'],
                playerListEntry['MuteState']['IsGlobal']
            );
            this.handlePlayerDeafenState(
                playerId,
                playerListEntry['DeafenState']['State'],
                playerListEntry['DeafenState']['IsGlobal']
            );
            playerControl._label.isControllingInput = playerListEntry['InputController'];
        });
    }

    public handleInputController(controlsInput: boolean): void {
        if (this._controlsInput != controlsInput) {
            this._playersMap.forEach((control: PlayerEntry, _id: string) => {
                control.updateControls(controlsInput);
            });
        }
        this._controlsInput = controlsInput;
    }

    public handlePlayerMuteState(targetPlayer: string, isMuted: boolean, isGlobal: boolean): void {
        if (!this._playersMap.has(targetPlayer)) {
            return;
        }

        const playerEntry = this._playersMap.get(targetPlayer);
        isGlobal
            ? (playerEntry.globalMuteButton.button.value = isMuted ? 'Global Unmute' : 'Global Mute')
            : (playerEntry.muteButton.button.value = isMuted ? 'Unmute' : 'Mute');

        playerEntry._label.isMuted = isMuted;
    }

    public handlePlayerDeafenState(targetPlayer: string, isDeafened: boolean, isGlobal: boolean): void {
        if (!this._playersMap.has(targetPlayer)) {
            return;
        }

        const playerEntry = this._playersMap.get(targetPlayer);
        isGlobal
            ? (playerEntry.globalDeafenButton.button.value = isDeafened ? 'Global Undeafen' : 'Global Deafen')
            : (playerEntry.deafenButton.button.value = isDeafened ? 'Undeafen' : 'Deafen');

        playerEntry._label.isDeafened = isDeafened;
    }

    public handlePlayerActivityState(targetPlayer: string, state: boolean): void {
        if (!this._playersMap.has(targetPlayer)) {
            return;
        }

        const playerEntry = this._playersMap.get(targetPlayer);
        playerEntry._label.isActive = state;
    }
}
