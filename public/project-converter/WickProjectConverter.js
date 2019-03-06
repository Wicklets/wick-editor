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
            var arrayBuffer = reader.result;
            var byteArray = new Uint8Array(arrayBuffer);
            var wickProjectJSON = LZString.decompressFromUint8Array(byteArray);
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

    static convertProject (project) {
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

    static convertAsset (asset) {
        // TODO image asset
        // TODO sound asset
    }

    static convertClip (clip) {
        var convertedClip = new Wick.Clip();

        // Clip attributes
        // TODO

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

    static convertButton (button) {
        var convertedClip = WickProjectConverter.convertClip(button);
        var convertedButton = convertedClip.convertedToButton();
        return convertedButton;
    }

    static convertLayer (layer) {
        var convertedLayer = new Wick.Layer();

        // Layer attributes
        // TODO

        // Frames
        layer.frames.forEach(frame => {
            var convertedFrame = WickProjectConverter.convertFrame(frame);
            convertedLayer.addFrame(convertedFrame);
        });

        return convertedLayer;
    }

    static convertFrame (frame) {
        var convertedFrame = new Wick.Frame();

        // Frame attributes
        // TODO

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
            }
        });

        // Tweens
        frame.tweens.forEach(tween => {
            var convertedTween = WickProjectConverter.convertTween(tween);
            convertedFrame.addTween(convertedTween);
        });

        return convertedFrame;
    }

    static convertTween (tween) {
        var convertedTween = new Wick.Tween();

        // Tween attributes
        // TODO

        return convertedTween;
    }

    static convertPath (path) {
        var convertedPath = new Wick.Path();

        // Path attributes
        // TODO

        return convertedPath;
    }

    static convertImage (image) {
        var convertedImage = new Wick.Path();

        // Create raster
        // TODO

        return convertedImage;
    }

    static convertText (text) {
        var convertedText = new Wick.Path();

        // Create textitem
        // TODO

        return convertedText;
    }

    static convertScript (script) {
        // First pass: Dump whole script into Load event.
        // Second pass: Parse event functions, unindent function bodies, create events for each corresponding event function
    }
}
