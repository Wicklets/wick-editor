/*
 * Copyright 2020 WICKLETS LLC
 *
 * This file is part of Wick Editor.
 *
 * Wick Editor is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Wick Editor is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Wick Editor.  If not, see <https://www.gnu.org/licenses/>.
 */


/**
 * filehandler.js creates several global save functions in the window that 
 * can be overridden in order to change the saving properties based
 * on the platform.
 * 
 * If not default handlers are defined, they are defaulted to the 
 * functions below. Files are saved in accordance with browser-based file 
 * saving libraries.
 */

import { saveAs } from 'file-saver';
import timeStamp from '../Editor/Util/DataFunctions/timestamp';

export default function initializeDefaultFileHandlers() {

  if (!window.saveFileFromWick) {
    /**
     * Attempts to save a file to the device. 
     * @param {Blob} file File to save.
     * @param {String} name Name of file to save, including extension.
     * @param {String} extension File extension that should be appended to the file. (ex. .zip, .wick)
     */
    window.saveFileFromWick = (file, name, extension) => {
      const filename = name + timeStamp() + extension;
      saveAs(file, filename);
      return true;
    }
  }

  if (!window.createFileInput) {
    /**
     * Creates a hidden input on the document. Returns a callback that can be used to
     * activate the input.
     * 
     * @param args {object} takes 
     *  @param onChange {function} function to call when change occurs.
     *  @param multiple {boolean}  if true, allows multiple elements to be chosen at once.
     *  @param accept   {string}   a comma separated string of file types to accept. 
     *                             Accepts all files if not privided.
     *  @returns {function} function to call when input should be activated.
     */

    window.createFileInput = (args) => {
      let onChange = args.onChange || (() => { console.log("Updating Chosen Element") });
      let input = document.createElement('input');
      input.type = 'file';
      input.style.display = 'none';
      args.accept && (input.accept = args.accept);
      input.onchange = onChange;
      args.multiple && (input.multiple = "multiple");
      input.className = "wick-editor-hidden-file-input";

      function clickInput() {
        input.click();
      }

      return clickInput;
    }
  }
}

