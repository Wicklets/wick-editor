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
 * If no default handlers are defined, they are defaulted to the 
 * functions below. Files are saved in accordance with browser-based file 
 * saving libraries.
 * 
 * Downloadable platforms should develop alternatives to these methods, and 
 * load them prior to the editor being loaded.
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
     * @param {function} successCallback Callback to be called if save is successful.
     * @param {function} failureCallback Callback to be called if save is unsuccessful.
     */
    window.saveFileFromWick = (file, name, extension, successCallback, failureCallback) => {
      const filename = name + timeStamp() + extension;
      saveAs(file, filename);
      successCallback && successCallback() // Unfortunately, we can't check for success or failure from  browser...
    }
  } else {
    // Otherwise, this already exists... We should add an "Overwrite" warning.

    let oldSave = window.saveFileFromWick;
    window.saveFileFromWick = (file, name, extension, successCallback, failureCallback) => {
      let proposedFileName =  name + extension;
      window.getSavedWickFiles(files => {
        let warn = false; 
        for (let file of files) {
          if (file.name === proposedFileName) {
            warn = true;
            break;
          }
        }

        if (warn) {
          window.warnBeforeSave({
            title: "Overwrite Save?",
            description: "A previous save has this name!",
            acceptText: "Save",
            acceptAction: () => oldSave(file, name, extension, successCallback, failureCallback),
            cancelText: "Cancel",
            cancelAction: () => {failureCallback && failureCallback()},
          });
        } else {
          oldSave(file, name, extension, successCallback, failureCallback);
        }
      });
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

  /**
   * @param {function} callback Callback to be sent array of file entries. 
   * @returns {undefined} 
   */
  if (!window.getSavedWickFiles) {
    window.getSavedWickFiles = (callback) => {
      console.error("Get Saved Files Not Implemented");
      callback([]);
    }
  }

  /**
   * Deletes a local file.
   * @param {fileEntry} fileEntry - File entry of file to delete.
   * @param {function} - callback to call on successful deletion.
   * @param {function} - callback to call on failed deletion.
   */
  if (!window.deleteLocalWickFile) {
    window.deleteLocalWickFile = (fileEntry, successCallback, failureCallback) => {
      console.error("Delete Local Files Not Implemented")
    }
  }

  /**
   * Can be one of "local" or "browser". If on device storage is being used directly,
   * should be set to "local", and all other functions in this file should be redefined.
   */
  if (!window.wickEditorFileSystemType) {
    window.wickEditorFileSystemType = "browser";
  }

  /**
   * Must be an Array containing at least one of the following.
   * Animation, Interactive, Sound, Image
   */
  if (!window.allowedExportTypes) {
    window.allowedExportTypes = ['Animation', 'Interactive', 'Audio', 'Images'];
  } else if (window.allowedExportTypes.length === 0) {
    window.allowedExportTypes = ['Animation', 'Interactive', 'Audio', 'Images'];
  }

  /**
   * Enable asset library if not set.
   */
   if (window.enableAssetLibrary === undefined) {
    window.enableAssetLibrary = true;
   }
}

