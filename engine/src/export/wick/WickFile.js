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
 * Utility class for creating and parsing wick files.
 */
Wick.WickFile = class {
    /**
     * Generate some metadata for debugging wick projects.
     * @returns {object}
     */
    static generateMetaData () {
        return {
            wickengine: Wick.version,
            platform: {
                name: platform.name,
                version: platform.version,
                product: platform.product,
                manufacturer: platform.manufacturer,
                layout: platform.layout,
                os: {
                    architecture: platform.os.architecture,
                    family: platform.os.family,
                    version: platform.os.version,
                },
                description: platform.description,
            }
        };
    }

    /**
     * Create a project from a wick file.
     * @param {File} wickFile - Wick file containing project data.
     * @param {function} callback - Function called when the project is created.
     * @param {string} format - The format to return. Can be 'blob' or 'base64'.
     */
    static fromWickFile (wickFile, callback, format) {
        if(!format) {
            format = 'blob';
        }
        if(format !== 'blob' && format !== 'base64') {
            console.error('WickFile.toWickFile: invalid format: ' + format);
            return;
        }

        var zip = new JSZip();
        zip.loadAsync(wickFile, {base64: format === 'base64'}).then((contents) => {
            contents.files['project.json'].async('text')
            .then(projectJSON => {
                var projectData = JSON.parse(projectJSON);
                if(!projectData.objects) {
                    // No metadata! This is a pre 1.0.9a project. Convert it.
                    console.log('Wick.WickFile: Converting old project format.');
                    projectData = Wick.WickFile.Alpha.convertJsonProject(projectData);
                }

                projectData.assets = [];

                for(var uuid in projectData.objects) {
                    var data = projectData.objects[uuid];
                    var object = Wick.Base.fromData(data);
                    Wick.ObjectCache.addObject(object);
                }
                var project = Wick.Base.fromData(projectData.project);
                Wick.ObjectCache.addObject(project);

                var loadedAssetCount = 0;
                // Immediately end if the project has no assets.
                if (project.getAssets().length === 0) {
                    this._prepareProject(project);
                    callback(project);
                } else {
                    project.getAssets().forEach(assetData => {
                        var assetFile = contents.files['assets/' + assetData.uuid + '.' + assetData.fileExtension];
                        assetFile.async('base64')
                        .then(assetFileData => {
                            var assetSrc = 'data:' + assetData.MIMEType + ';base64,' + assetFileData;
                            Wick.FileCache.addFile(assetSrc, assetData.uuid);
                        }).catch(e => {
                            console.log('Error loading asset file.');
                            console.log(e);
                            callback(null);
                        }).finally(() => {
                            assetData.load(() => {
                                loadedAssetCount++;
                                if(loadedAssetCount === project.getAssets().length) {
                                    this._prepareProject(project);
                                    callback(project);
                                }
                            });
                        });
                    });
                }
            });
        }).catch((e) => {
            console.log('Error loading project zip.')
            console.log(e);
            callback(null);
        });
    }

    /**
     * Create a wick file from the project.
     * @param {Wick.Project} project - the project to create a wick file from
     * @param {function} callback - Function called when the file is created. Contains the file as a parameter.
     * @param {string} format - The format to return. Can be 'blob' or 'base64'.
     */
    static toWickFile (project, callback, format) {
        if(!format) {
            format = 'blob';
        }
        if(format !== 'blob' && format !== 'base64') {
            console.error('WickFile.toWickFile: invalid format: ' + format);
            return;
        }

        var zip = new JSZip();

        // Create assets folder
        var assetsFolder = zip.folder("assets");

        // Populate assets folder with files
        project.getAssets().filter(asset => {
            return asset instanceof Wick.ImageAsset
                || asset instanceof Wick.SoundAsset
                || asset instanceof Wick.FontAsset
                || asset instanceof Wick.ClipAsset;
        }).forEach(asset => {
            // Create file from asset dataurl, add it to assets folder
            var fileExtension = asset.MIMEType.split('/')[1];
            var filename = asset.uuid;
            var data = asset.src.split(',')[1];
            assetsFolder.file(filename + '.' + fileExtension, data, {base64: true});
        });

        var objectCacheSerialized = {};
        Wick.ObjectCache.getActiveObjects(project).forEach(object => {
            objectCacheSerialized[object.uuid] = object.serialize();
        });

        var projectSerialized = project.serialize();

        for(var uuid in objectCacheSerialized) {
            if(objectCacheSerialized[uuid].classname === 'Project') {
                delete objectCacheSerialized[uuid];
            }
        }

        // Remove some extra data that we don't actually want to save
        // Clear selection:
        for(var uuid in objectCacheSerialized) {
            var object = objectCacheSerialized[uuid];
            if(object.classname === 'Selection') {
                object.selectedObjects = [];
            }
        }
        // Set focus to root
        for(var uuid in objectCacheSerialized) {
            var object = objectCacheSerialized[uuid];
            if(projectSerialized.children.indexOf(uuid) !== -1 && object.classname === 'Clip') {
                projectSerialized.focus = uuid;
            }
        }
        // Reset all playhead positions
        for(var uuid in objectCacheSerialized) {
            var object = objectCacheSerialized[uuid];
            if(object.classname === 'Timeline') {
                object.playheadPosition = 1;
            }
        }

        // Add project json to root directory of zip file
        var projectData = {
            project: projectSerialized,
            objects: objectCacheSerialized,
        };
        zip.file("project.json", JSON.stringify(projectData, null, 2));

        zip.generateAsync({
            type: format,
            compression: "DEFLATE",
            compressionOptions: {
                level: 9
            },
        }).then(callback);
    }

    /* Make any small backwards compatibility fixes needed */
    static _prepareProject (project) {
        // 1.16+ projects don't allow gaps between frames.
        Wick.ObjectCache.getAllObjects().filter(object => {
            return object instanceof Wick.Timeline;
        }).forEach(timeline => {
            var oldFrameGapFillMethod = timeline.fillGapsMethod;
            timeline.fillGapsMethod = 'blank_frames';
            timeline.resolveFrameGaps();
            timeline.fillGapsMethod = oldFrameGapFillMethod;
        });
    }
}
