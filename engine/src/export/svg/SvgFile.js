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
 * Utility class for creating and parsing wickobject files.
 */
Wick.SVGFile = class {
    /**
     * Create a project from a wick file.
     * @param {Blob | string} svgFile - WickObject file containing object data (can be a Blob or a dataURL string)
     * @param {function} callback - Function called when the object is done being loaded
     */
    static fromSVGFile(svgFile, callback) {
        // Convert to blob if needed
        //if(typeof svgFile === 'string') {
        //    svgFile = Wick.ExportUtils.dataURItoBlob(svgFile);
        //}

        //var fr = new FileReader();
        //load the SVG, converting objexts to paths
        // Convert to blob if needed

        //var para = window.document.createElement("P"); // Create a <p> element
        //para.innerText = "svgFile.classname " + '\n' + typeof svgFile + '\n'; // Insert text
        //window.document.body.appendChild(para); // Appe

        if (typeof svgFile === 'string') {
            //para = window.document.createElement("P"); // Create a <p> element
            //para.innerText = "svgFile" + '\n' + svgFile + '\n'; // Insert text
            //window.document.body.appendChild(para); // Append <p> to <body>
            svgFile = Wick.ExportUtils.dataURItoBlob(svgFile);
            //para = window.document.createElement("P"); // Create a <p> element
            //para.innerText = "svgFile" + '\n' + svgFile + '\n'; // Insert text
            //window.document.body.appendChild(para); // Append <p> to <body>
        }


        var fr = new FileReader();

        fr.onload = function() {
            //para = window.document.createElement("div"); // Create a <p> element
            // para.innerText = "result1" + '\n' + fr.result + '\n'; // Insert text
            //window.document.body.appendChild(para); //
            callback(fr.result);
            //para = window.document.createElement("div"); // Create a <p> element
            //para.innerText = "result1" + '\n' + fr.result + '\n'; // Insert text
            //window.document.body.appendChild(para); //
        };

        fr.readAsText(svgFile);
        //enumbertae all the paths that have been loaded, exporting as JSON and then that being used to creating a new wicks path for every item... also need to deal with asasets


    }

    /**
     * Create a wick file from the project.
     * @param {Wick.Timeline} timeline - the clip to create a wickobject file from
     * @param {function(string)} onError - Can be 'blob' or 'dataurl'.
     * @param {function(blob)} callback - function to call when done
     * @returns {Blob}
     */
    static toSVGFile(timeline, onError, callback) {

        var svgString = timeline.exportSVG(onError);
        var blob = new Blob([svgString], { type: 'image/svg+xml' });
        callback(blob);
        return blob;
    }
}