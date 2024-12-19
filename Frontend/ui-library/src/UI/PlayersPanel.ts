// Copyright Epic Games, Inc. All Rights Reserved.

import { LabelledButton } from './LabelledButton';

/**
 * A UI component containing all the players for the application.
 */
export class PlayersPanel {
    _rootElement: HTMLElement;
    _playersCloseButton: HTMLElement;
    _playersContentElement: HTMLElement;
    _playerList: HTMLElement;

    /* A map of players we are storing/rendering */
    _playersMap = new Map<string, LabelledButton>();
    onMuteListener: (playerId: string) => void;

    constructor() {
        this._rootElement = null;
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
        this._playersMap.forEach((_button: LabelledButton, id: string) => {
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
                const controlButton = new LabelledButton(playerId, 'Mute');
                controlButton.addOnClickListener(() => {
                    controlButton.button.value = controlButton.button.value === 'Mute' ? 'Unmute' : 'Mute';
                    this.onMuteListener(playerId);
                });

                this.playerList.appendChild(controlButton.rootElement);
                this._playersMap.set(playerId, controlButton);
            }
        });
    }
}
