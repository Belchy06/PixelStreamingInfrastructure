// Copyright Epic Games, Inc. All Rights Reserved.

/**
 * A button.
 */
export class Button {
    _buttonText: string;
    _rootElement: HTMLElement;
    _button: HTMLInputElement;

    constructor(buttonText: string) {
        this._buttonText = buttonText;
    }

    /**
     * Add a click listener to the button element.
     */
    public addOnClickListener(onClickFunc: () => void) {
        this.button.addEventListener('click', onClickFunc);
    }

    /**
     * Get the HTMLInputElement for the button.
     */
    public get button(): HTMLInputElement {
        if (!this._button) {
            this._button = document.createElement('input');
            this._button.type = 'button';
            this._button.value = this._buttonText;
            this._button.classList.add('overlay-button');
            this._button.classList.add('btn-flat');
        }
        return this._button;
    }

    /**
     * @returns Return or creates a HTML element that represents this setting in the DOM.
     */
    public get rootElement(): HTMLElement {
        if (!this._rootElement) {
            // create label element to wrap out input type
            this._rootElement = document.createElement('label');
            this._rootElement.classList.add('btn-overlay');
            this._rootElement.appendChild(this.button);
        }
        return this._rootElement;
    }
}
