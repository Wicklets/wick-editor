/*
 * Copyright 2019 WICKLETS LLC
 *
 * This file is part of Wick Engine.
 *
 * Wick Engine is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Wick Engine is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Utility class for opening Wick projects inside popup windows.
 */
Wick.HTMLPreview = class {
    /**
     * Runs a project inside a popup window.
     * @param {Wick.Project} project - The project to run.
     * @param {function} callback - Function that's called when the popup is successfully created.
     */
    static previewProject (project, callback) {
        Wick.HTMLExport.bundleProject(project, html => {
            var windowFeatures = "height="+project.height+",width="+project.width;
            var popupWindow = window.open('', '_blank', windowFeatures);
            if(popupWindow) {
                popupWindow.document.title = project.name;
                popupWindow.document.open();
                popupWindow.document.write(html);
                popupWindow.document.close();
            }
            callback(popupWindow);
        });
    }
}
