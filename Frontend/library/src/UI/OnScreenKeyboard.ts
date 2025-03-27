// Copyright Epic Games, Inc. All Rights Reserved.

import { UntranslatedCoordUnsigned } from '../Util/InputCoordTranslator';

/**
 * Class for handling on screen keyboard usage
 */
export class OnScreenKeyboard {
    // A hidden input text box which is used only for focusing and opening the
    // on-screen keyboard.
    hiddenInput: HTMLInputElement;

    /**
     *
     * @param videoElementParent The div element the video player is injected into
     */
    constructor(videoElementParent: HTMLElement) {
        this.hiddenInput = null;

        this.createOnScreenKeyboardHelpers(videoElementParent);
    }

    /**
     * An override for unquantizeAndDenormalizeUnsigned
     * @param x the x axis point
     * @param y the y axis point
     * @returns unquantizeAndDenormalizeUnsigned object
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    unquantizeAndDenormalizeUnsigned(x: number, y: number): UntranslatedCoordUnsigned {
        return null;
    }

    /**
     * Creates on screen keyboard helpers
     * @param videoElementParent The div element the video player i injected into
     */
    createOnScreenKeyboardHelpers(videoElementParent: HTMLElement) {
        if (!this.hiddenInput) {
            this.hiddenInput = document.createElement('input');
            this.hiddenInput.id = 'hiddenInput';
            this.hiddenInput.maxLength = 0;

            // Set inline style so that users not using the UI library
            // will  still have this element display correctly
            this.hiddenInput.style.position = 'absolute';
            this.hiddenInput.style.left = '-10%';
            this.hiddenInput.style.width = '0px';
            this.hiddenInput.style.opacity = '0';

            videoElementParent.appendChild(this.hiddenInput);
        }
    }

    /**
     * Shows the on screen keyboard
     * @param command the command received via the data channel containing keyboard positions
     */
    showOnScreenKeyboard(command: any) {
        if (!this.hiddenInput) {
            return;
        }

        if (command.showOnScreenKeyboard) {
            // Show the on-screen keyboard.
            this.hiddenInput.focus();
        } else {
            // Hide the on-screen keyboard.
            this.hiddenInput.blur();
        }
    }
}
