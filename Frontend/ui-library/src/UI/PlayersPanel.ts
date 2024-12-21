// Copyright Epic Games, Inc. All Rights Reserved.

import { Button } from './Button';

export class PlayerContol {
    _label: string;
    _rootElement: HTMLElement;
    _muteButton: Button;
    _onMuteListener: () => void;
    _kickButton: Button;
    _onKickListener: () => void;
    _controlsInputButton: Button;
    _onControlsInputButton: () => void;

    constructor(
        label: string,
        onMuteListener: () => void,
        onKickListener: () => void,
        onControlsInputButton: () => void
    ) {
        this._label = label;
        this._onMuteListener = onMuteListener;
        this._onKickListener = onKickListener;
        this._onControlsInputButton = onControlsInputButton;
    }

    public get kickButton(): Button {
        if (!this._kickButton) {
            this._kickButton = new Button('Kick');
            this._kickButton.addOnClickListener(this._onKickListener);
        }
        return this._kickButton;
    }

    public get muteButton(): Button {
        if (!this._muteButton) {
            this._muteButton = new Button('Mute');
            this._muteButton.addOnClickListener(() => {
                this._muteButton.button.value = this._muteButton.button.value === 'Mute' ? 'Unmute' : 'Mute';
            });
            this._muteButton.addOnClickListener(this._onMuteListener);
        }
        return this._muteButton;
    }

    public get controlsInputButton(): Button {
        if (!this._controlsInputButton) {
            this._controlsInputButton = new Button('Give input control');
            this._controlsInputButton.addOnClickListener(this._onControlsInputButton);
        }
        return this._controlsInputButton;
    }

    public get rootElement(): HTMLElement {
        if (!this._rootElement) {
            // create root div with "setting" css class
            this._rootElement = document.createElement('div');
            this._rootElement.classList.add('setting');

            // create div element to contain our setting's text
            const settingsTextElem = document.createElement('div');
            settingsTextElem.innerText = this._label;
            this._rootElement.appendChild(settingsTextElem);

            const buttonsElement = document.createElement('div');
            buttonsElement.appendChild(this.kickButton.rootElement);
            buttonsElement.appendChild(this.muteButton.rootElement);
            buttonsElement.appendChild(this.controlsInputButton.rootElement);

            this._rootElement.appendChild(buttonsElement);
        }
        return this._rootElement;
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

    /* A map of players we are storing/rendering */
    _playersMap = new Map<string, PlayerContol>();
    onMuteListener: (playerId: string) => void;
    onKickListener: (playerId: string) => void;
    onControlsInputListener: (playerId: string) => void;

    constructor() {
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

    public handlePlayerList(playerIds: Array<string>): void {
        // Remove players that have disconnected
        const removedPlayerIds: string[] = [];
        this._playersMap.forEach((_control: PlayerContol, id: string) => {
            if (!playerIds.includes(id)) {
                removedPlayerIds.push(id);
            }
        });

        removedPlayerIds.forEach((removedPlayerId: string) => {
            const removedPlayer = this._playersMap.get(removedPlayerId);
            this.playerList.removeChild(removedPlayer.rootElement);
            this._playersMap.delete(removedPlayerId);
        });

        playerIds.forEach((playerId: string) => {
            if (!this._playersMap.has(playerId)) {
                const playerControl = new PlayerContol(
                    playerId,
                    () => this.onMuteListener(playerId),
                    () => this.onKickListener(playerId),
                    () => this.onControlsInputListener(playerId)
                );
                playerControl.kickButton.rootElement.style.visibility = this._controlsInput
                    ? 'visible'
                    : 'hidden';
                playerControl.controlsInputButton.rootElement.style.visibility = this._controlsInput
                    ? 'visible'
                    : 'hidden';

                this.playerList.appendChild(playerControl.rootElement);
                this._playersMap.set(playerId, playerControl);
            }
        });
    }

    public handleInputController(controlsInput: boolean): void {
        this._controlsInput = controlsInput;
        this._playersMap.forEach((control: PlayerContol, _id: string) => {
            control.kickButton.rootElement.style.visibility = controlsInput ? 'visible' : 'hidden';
            control.controlsInputButton.rootElement.style.visibility = controlsInput ? 'visible' : 'hidden';
        });
    }
}
