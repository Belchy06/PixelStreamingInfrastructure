// Copyright Epic Games, Inc. All Rights Reserved.

/**
 * A slider.
 */
export class Slider {
    _sliderText: string;
    _rootElement: HTMLElement;
    _label: HTMLElement;
    _slider: HTMLInputElement;

    constructor(sliderText: string) {
        this._sliderText = sliderText;
    }

    /**
     * Add a click listener to the button element.
     */
    public addOnChangeListener(onChangeFunc: (value: number) => void) {
        this.slider.addEventListener('input', (event: Event) => {
            const inputElem = event.target as HTMLInputElement;
            const parsedValue = Number.parseFloat(inputElem.value);
            if (!isNaN(parsedValue)) {
                onChangeFunc(parsedValue);
            }
        });
    }

    /**
     * Get the HTMLInputElement for the button.
     */
    public get slider(): HTMLInputElement {
        if (!this._slider) {
            this._slider = document.createElement('input');
            this._slider.type = 'range';
        }
        return this._slider;
    }

    public get label(): HTMLElement {
        if (!this._label) {
            this._label = document.createElement('div');
            this._label.innerHTML = this._sliderText;
            this._label.classList.add('sliderLabel');
        }
        return this._label;
    }

    /**
     * @returns Return or creates a HTML element that represents this setting in the DOM.
     */
    public get rootElement(): HTMLElement {
        if (!this._rootElement) {
            // create label element to wrap out input type
            this._rootElement = document.createElement('label');
            this._rootElement.classList.add('btn-overlay');
            this._rootElement.appendChild(this.label);
            this._rootElement.appendChild(this.slider);
        }
        return this._rootElement;
    }
}
