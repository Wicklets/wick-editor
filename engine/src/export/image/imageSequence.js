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
 * Utility class for generating image sequences.
 */
Wick.ImageSequence = class {
    /**
     * Create a png sequence from a project.
     * @param {Wick.Project} project - the project to create a png sequence from
     * @param {function} callback - Function called when the file is created. Contains the file as a parameter.
     **/
    static toPNGSequence (args) {
        let { project, onProgress, onFinish } = args;

        var zip = new JSZip();

        let buildZip = (files) => {
            let index = 0;
            files.forEach((file) => {
                var blob = Wick.ExportUtils.dataURItoBlob(file.src);
                zip.file('frame' + index + '.png', blob);
                index += 1;
            });

            zip.generateAsync({
                type: 'blob',
                compression: "DEFLATE",
                compressionOptions: {
                    level: 9
                },
            }).then(onFinish);
        }

        project.generateImageSequence({
            width: args.width,
            height: args.height,
            onFinish: buildZip,
            onProgress: onProgress,
        });
    }
}
