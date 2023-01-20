/*
 * Copyright 2020 WICKLETS LLC
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
 * Utility class for generating an image file.
 */
Wick.ImageFile = class {
    /**
     * Create a png sequence from a project.
     * @param {Wick.Project} project - the project to create a png sequence from
     * @param {function} callback - Function called when the file is created. Contains the file as a parameter.
     **/
    static toPNGFile (args) {
        let { project, onProgress, onFinish } = args;

        // console.log('ImageFile.toPNGFile', args);

        // var zip = new JSZip();

        let buildImage = (image) => {
            // console.log('ImageFile.toPNGFile image', image);

            var blob = Wick.ExportUtils.dataURItoBlob(image.src);

            onFinish(blob);
        };

        // console.log('ImageFile.toPNGFile', project);

        project.generateImageFile({
            width: args.width,
            height: args.height,
            onFinish: buildImage,
            onProgress: onProgress,
        });
    }
};
