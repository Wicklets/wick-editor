/*
 * Utility class to convert Wick Alpha 1.0.01 projects into Wick 1.0 (Bagel) projects.
 */
class Wick100aProjectConverter {
    /**
     * Converts a Wick 1.0.0a project file (html, zip, or wick) into a Wick 1.0 project.
     */
    static convertWick100aProject (file, callback) {
        var zip = new JSZip();
        zip.loadAsync(file).then(function(contents) {
            contents.files['project.json'].async('text').then(projectJSON => {
                projectJSON = JSON.parse(projectJSON);
                var newProjectJSON = Wick100aProjectConverter.convertJsonProject(projectJSON);
                console.log(newProjectJSON);

                zip.file("project.json", JSON.stringify(newProjectJSON, null, 2));
                zip.generateAsync({
                    type:"blob",
                    compression: "DEFLATE",
                    compressionOptions: {
                        level: 9
                    },
                }).then(callback);
            });
        });
    }

    /**
     * Convert the old recursive format to the new flat format.
     */
    static convertJsonProject (projectJSON) {
        var newProjectJSON = projectJSON;
        newProjectJSON.pan = {x: 0, y: 0};
        newProjectJSON.zoom = 1;
        var newProjectObjects = {};

        Wick100aProjectConverter.flattenWickObject(projectJSON, null, newProjectObjects);

        return {
            project: newProjectJSON,
            objects: newProjectObjects,
        };
    }

    static flattenWickObject (objectJSON, parentJSON, objects) {
        objectJSON.children = [];
        if(parentJSON) parentJSON.children.push(objectJSON.uuid);
        objects[objectJSON.uuid] = objectJSON;

        if(objectJSON.root) {
            objectJSON.focus = objectJSON.root.uuid;
            Wick100aProjectConverter.flattenWickObject(objectJSON.root, objectJSON, objects);
            delete objectJSON.root;
        }
        if(objectJSON.assets) {
            objectJSON.assets.forEach(asset => {
                Wick100aProjectConverter.flattenWickObject(asset, objectJSON, objects);
            });
            delete objectJSON.assets;
        }
        if(objectJSON.selection) {
            Wick100aProjectConverter.flattenWickObject(objectJSON.selection, objectJSON, objects);
            delete objectJSON.selection;
        }
        if(objectJSON.transform) {
            objectJSON.transformation = {
                x: objectJSON.transform.x,
                y: objectJSON.transform.y,
                scaleX: objectJSON.transform.scaleX,
                scaleY: objectJSON.transform.scaleY,
                rotation: objectJSON.transform.rotation,
                opacity: objectJSON.transform.opacity,
            }
            delete objectJSON.transform;
        }
        if(objectJSON.timeline) {
            Wick100aProjectConverter.flattenWickObject(objectJSON.timeline, objectJSON, objects);
            delete objectJSON.timeline;
        }
        if(objectJSON.layers) {
            objectJSON.layers.forEach(layer => {
                Wick100aProjectConverter.flattenWickObject(layer, objectJSON, objects);
            });
            delete objectJSON.layers;
        }
        if(objectJSON.frames) {
            objectJSON.frames.forEach(frame => {
                Wick100aProjectConverter.flattenWickObject(frame, objectJSON, objects);
            });
            delete objectJSON.frames;
        }
        if(objectJSON.clips) {
            objectJSON.clips.forEach(clip => {
                Wick100aProjectConverter.flattenWickObject(clip, objectJSON, objects);
            });
            delete objectJSON.clips;
        }
        if(objectJSON.paths) {
            objectJSON.paths.forEach(path => {
                Wick100aProjectConverter.flattenWickObject(path, objectJSON, objects);
            });
            delete objectJSON.paths;
        }
        if(objectJSON.tweens) {
            objectJSON.tweens.forEach(tween => {
                Wick100aProjectConverter.flattenWickObject(tween, objectJSON, objects);
            });
            delete objectJSON.tweens;
        }
        if(objectJSON.pathJSON) {
            objectJSON.json = objectJSON.pathJSON;
            delete objectJSON.pathJSON;
        }
    }
}
