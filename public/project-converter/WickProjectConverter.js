/* 
 * Utility class to convert Wick Alpha 15.2 projects into Wick 1.0 (Bagel) projects.
 */
class WickProjectConverter {
    /**
     * Converts an exported Wick v15.2 project (ZIP) into a Wick 1.0 project.
     */
    static convertOldWickZIP (zipFile, callback) {
        // TODO
    }

    /**
     * Converts an exported Wick v15.2 project (HTML) into a Wick 1.0 project.
     */
    static convertOldWickHTML (htmlFile, callback) {
        // TODO
    }

    /**
     * Converts a Wick v15.2 Wick File into a Wick 1.0 project.
     */
    static convertOldWickFile (wickFile, callback) {
        var reader = new FileReader();
        reader.onload = function(e) {
            // Decompress and parse project data
            // (From Wick 15.2 InputHandler class)
            var wickProjectCompressedJSONRaw = reader.result;
            var wickProjectCompressedJSON = new Uint8Array(wickProjectCompressedJSONRaw);
            var wickProjectJSON = LZString.decompressFromUint8Array(wickProjectCompressedJSON);
            var project = WickProject.fromJSON(wickProjectJSON);

            // Retrieve project name from filename
            // (From Wick 15.2 InputHandler class)
            var filenameParts = wickFile.name.split('-');
            var name = filenameParts[0];
            if(name.includes('.json')) {
                name = name.split('.json')[0];
            }
            if(name.includes('.wick')) {
                name = name.split('.wick')[0];
            }
            project.name = name || 'New Project';

            // Convert the project!
            callback(WickProjectConverter.convertProject(project));
        };
        reader.readAsArrayBuffer(wickFile);
    }

    /**
     * Converts a Wick v15.2 WickProject object into a Wick 1.0 Wick.Project object.
     */
    static convertProject (project) {
        console.log('Converting project:');
        console.log(project);

        var convertedProject = new Wick.Project();
        convertedProject.root.timeline.layers[0].remove();

        // Project attributes
        convertedProject.backgroundColor = project.backgroundColor;
        convertedProject.framerate = project.framerate;
        convertedProject.width = project.width;
        convertedProject.height = project.height;

        // Asset library
        for(key in project.assets) {
            var asset = WickProjectConverter.convertAsset(project.assets[key]);
            convertProject.addAsset(asset);
        }

        // Root clip
        convertedProject.root = WickProjectConverter.convertClip(project.rootObject);
        convertedProject.focus = convertedProject.root;

        return convertedProject;
    }

    /**
     * Converts a Wick v15.2 WickAsset object into a Wick 1.0 Wick.Asset object.
     */
    static convertAsset (asset) {
        if(asset.type === '???') {
            // Image asset
            return WickProjectConverter.convertImageAsset(asset);
        } else if (asset.type === '???') {
            // Sound asset
            return WickProjectConverter.convertImageAsset(asset);
        } else {
            console.error('Add a convert routine for "' + asset.type + '" assets, please!!');
            return null;
        }
    }

    /**
     * Converts a Wick v15.2 WickAsset object into a Wick 1.0 Wick.ImageAsset object.
     */
    static convertImageAsset (imageAsset) {
        var convertedImageAsset = new Wick.ImageAsset();

        // Image asset properties
        // TODO

        return convertedImageAsset;
    }

    /**
     * Converts a Wick v15.2 WickAsset object into a Wick 1.0 Wick.SoundAsset object.
     */
    static convertSoundAsset (soundAsset) {
        var convertedSoundAsset = new Wick.SoundAsset();

        // Sound asset properties
        // TODO

        return convertedSoundAsset;
    }

    /**
     * Converts a Wick v15.2 WickObject object into a Wick 1.0 Wick.Clip object.
     */
    static convertClip (clip) {
        var convertedClip = new Wick.Clip();

        // Clip attributes
        convertedClip.identifier = clip.name;

        // Clip transform
        convertedClip.transform.x = clip.x;
        convertedClip.transform.y = clip.y;
        convertedClip.transform.scaleX = clip.scaleX;
        convertedClip.transform.scaleY = clip.scaleY;
        convertedClip.transform.rotation = clip.rotation;
        convertedClip.transform.opacity = clip.opacity;

        // Clip script
        WickProjectConverter.convertScript(clip.wickScript).forEach(script => {
            convertedClip.addScript(script.name, script.src);
        });

        // Layers
        clip.layers.forEach(layer => {
            var convertedLayer = WickProjectConverter.convertLayer(layer, new Wick.Layer());
            convertedClip.timeline.addLayer(convertedLayer);
        });

        return convertedClip;
    }

    /**
     * Converts a Wick v15.2 WickObject object into a Wick 1.0 Wick.Button object.
     */
    static convertButton (button) {
        var convertedClip = WickProjectConverter.convertClip(button);
        var convertedButton = convertedClip.convertedToButton();
        return convertedButton;
    }

    /**
     * Converts a Wick v15.2 WickLayer object into a Wick 1.0 Wick.Layer object.
     */
    static convertLayer (layer) {
        var convertedLayer = new Wick.Layer();

        // Layer attributes
        convertedLayer.name = layer.name;
        convertedLayer.locked = layer.locked;
        convertedLayer.hidden = layer.hidden;

        // Frames
        layer.frames.forEach(frame => {
            var convertedFrame = WickProjectConverter.convertFrame(frame);
            convertedLayer.addFrame(convertedFrame);
        });

        return convertedLayer;
    }

    /**
     * Converts a Wick v15.2 WickFrame object into a Wick 1.0 Wick.Frame object.
     */
    static convertFrame (frame) {
        var convertedFrame = new Wick.Frame();

        // Frame attributes
        convertedFrame.start = frame.playheadPosition;
        convertedFrame.end = frame.playheadPosition + frame.length - 1;
        convertedFrame._soundAssetUUID = frame.audioAssetUUID;

        // Frame script
        WickProjectConverter.convertScript(frame.wickScript).forEach(script => {
            convertedFrame.addScript(script.name, script.src);
        });

        // Wick objects
        frame.wickObjects.forEach(wickObject => {
            if(wickObject.isPath) {
                // Path
                var convertedPath = WickProjectConverter.convertPath(wickObject);
                convertedFrame.addPath(convertedPath);
            } else if(wickObject.isText) {
                // Text
                var convertedText = WickProjectConverter.convertText(wickObject);
                convertedFrame.addPath(convertedText);
            } else if (wickObject.isImage) {
                // Image
                var convertedImage = WickProjectConverter.convertedImage(wickObject);
                convertedFrame.addPath(convertedImage);
            } else if (wickObject.isClip || wickObject.isGroup) {
                // Clip
                var convertedClip = WickProjectConverter.convertClip(wickObject);
                convertedFrame.addClip(convertedClip);
            } else if (wickObject.isButton) {
                // Button
                var convertedButton = WickProjectConverter.convertButton(wickObject);
                convertedFrame.addClip(convertedButton);
            } else {
                console.error("Couldn't convert a wick object, did you forget a case?");
                console.log(wickObject);
            }
        });

        // Tweens
        frame.tweens.forEach(tween => {
            var convertedTween = WickProjectConverter.convertTween(tween);
            convertedFrame.addTween(convertedTween);
        });

        return convertedFrame;
    }

    /**
     * Converts a Wick v15.2 WickTween object into a Wick 1.0 Wick.Tween object.
     */
    static convertTween (tween) {
        var convertedTween = new Wick.Tween();

        // Tween attributes
        convertedTween.playheadPosition = tween.playheadPosition - 1;
        convertedTween.fullRotations = tween.rotations;

        // Tween transform
        convertedTween.transform.x = tween.x;
        convertedTween.transform.y = tween.y;
        convertedTween.transform.scaleX = tween.scaleX;
        convertedTween.transform.scaleY = tween.scaleY;
        convertedTween.transform.rotation = tween.rotation;
        convertedTween.transform.opacity = tween.opacity;

        return convertedTween;
    }

    /**
     * Converts a Wick v15.2 WickObject object into a Wick 1.0 Wick.Path object.
     */
    static convertPath (path) {
        var convertedPath = new Wick.Path();

        // Path attributes
        // TODO

        return convertedPath;
    }

    /**
     * Converts a Wick v15.2 WickObject object into a Wick 1.0 Wick.Path object.
     */
    static convertImage (image) {
        var convertedImage = new Wick.Path();

        // Create raster
        // TODO

        return convertedImage;
    }

    /**
     * Converts a Wick v15.2 WickObject object into a Wick 1.0 Wick.Text object.
     */
    static convertText (text) {
        var convertedText = new Wick.Path();

        // Create textitem
        // TODO

        return convertedText;
    }

    /**
     * Converts a string representing a Wick v15.2 script into a Wick 1.0 list of scripts.
     */
    static convertScript (script) {
        // First pass (easy): Dump whole script into Load event.
        // Second pass (hard): Parse event functions, unindent function bodies, create events for each corresponding event function
    }
}
