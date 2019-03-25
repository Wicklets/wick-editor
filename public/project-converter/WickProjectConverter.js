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
            // (This code is from the Wick 15.2 InputHandler class)
            var wickProjectCompressedJSONRaw = reader.result;
            var wickProjectCompressedJSON = new Uint8Array(wickProjectCompressedJSONRaw);
            var wickProjectJSON = LZString.decompressFromUint8Array(wickProjectCompressedJSON);
            var project = WickProject.fromJSON(wickProjectJSON);

            // Retrieve project name from filename
            // (This code is also from the Wick 15.2 InputHandler class)
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
        var convertedProject = new Wick.Project();

        // Project attributes
        convertedProject.name = project.name;
        convertedProject.backgroundColor = project.backgroundColor;
        convertedProject.framerate = project.framerate;
        convertedProject.width = project.width;
        convertedProject.height = project.height;

        // Asset library
        for(var key in project.library.assets) {
            var asset = WickProjectConverter.convertAsset(project.library.assets[key]);
            convertedProject.addAsset(asset);
        }

        // Root clip
        convertedProject.root = WickProjectConverter.convertClip(project.rootObject, convertedProject);
        convertedProject.focus = convertedProject.root;

        return convertedProject;
    }

    /**
     * Converts a Wick v15.2 WickAsset object into a Wick 1.0 Wick.Asset object.
     */
    static convertAsset (asset) {
        if(asset.type === 'image') {
            // Image asset
            return WickProjectConverter.convertImageAsset(asset);
        } else if (asset.type === 'audio') {
            // Sound asset
            return WickProjectConverter.convertSoundAsset(asset);
        } else {
            console.warn('Add a convert routine for "' + asset.type + '" assets, please!!');
            return null;
        }
    }

    /**
     * Converts a Wick v15.2 WickAsset object into a Wick 1.0 Wick.ImageAsset object.
     */
    static convertImageAsset (imageAsset) {
        var src = imageAsset.getData();
        var convertedImageAsset = new Wick.ImageAsset(imageAsset.filename, src);
        convertedImageAsset._uuid = imageAsset.uuid;
        convertedImageAsset.src = src; // To force WickFileCache to update with manually changed UUID.
        return convertedImageAsset;
    }

    /**
     * Converts a Wick v15.2 WickAsset object into a Wick 1.0 Wick.SoundAsset object.
     */
    static convertSoundAsset (soundAsset) {
        var src = soundAsset.getData();
        var convertedSoundAsset = new Wick.SoundAsset(soundAsset.filename, src);
        convertedSoundAsset._uuid = soundAsset.uuid;
        convertedSoundAsset.src = src; // To force WickFileCache to update with manually changed UUID.
        return convertedSoundAsset;
    }

    /**
     * Converts a Wick v15.2 WickObject object into a Wick 1.0 Wick.Clip object.
     */
    static convertClip (clip, convertedProject, type) {
        if(!type) type = 'Clip';

        var convertedClip = new Wick[type]();
        convertedClip.timeline.layers[0].remove();

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
            var convertedLayer = WickProjectConverter.convertLayer(layer, convertedProject);
            convertedClip.timeline.addLayer(convertedLayer);
        });

        return convertedClip;
    }

    /**
     * Converts a Wick v15.2 WickObject object into a Wick 1.0 Wick.Button object.
     */
    static convertButton (button, convertedProject) {
        var convertedButton = WickProjectConverter.convertClip(button, convertedProject, 'Button');
        return convertedButton;
    }

    /**
     * Converts a Wick v15.2 WickLayer object into a Wick 1.0 Wick.Layer object.
     */
    static convertLayer (layer, convertedProject) {
        var convertedLayer = new Wick.Layer();

        // Layer attributes
        convertedLayer.name = layer.name;
        convertedLayer.locked = layer.locked;
        convertedLayer.hidden = layer.hidden;

        // Frames
        layer.frames.forEach(frame => {
            var convertedFrame = WickProjectConverter.convertFrame(frame, convertedProject);
            convertedLayer.addFrame(convertedFrame);
        });

        return convertedLayer;
    }

    /**
     * Converts a Wick v15.2 WickFrame object into a Wick 1.0 Wick.Frame object.
     */
    static convertFrame (frame, convertedProject) {
        var convertedFrame = new Wick.Frame();

        // Frame attributes
        convertedFrame.identifier = frame.name;
        convertedFrame.start = frame.playheadPosition + 1;
        convertedFrame.end = frame.playheadPosition + frame.length;
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
                var convertedImage = WickProjectConverter.convertImage(wickObject, convertedProject);
                convertedFrame.addPath(convertedImage);
            } else if (wickObject.isButton) {
                // Button
                var convertedButton = WickProjectConverter.convertButton(wickObject, convertedProject);
                convertedFrame.addClip(convertedButton);
            } else if (wickObject.isClip || wickObject.isGroup || wickObject.isSymbol) {
                // Clip
                var convertedClip = WickProjectConverter.convertClip(wickObject, convertedProject);
                convertedFrame.addClip(convertedClip);
            } else {
                console.warn("Couldn't convert a wick object, did you forget a case?");
                console.warn(wickObject);
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
        convertedTween.playheadPosition = tween.playheadPosition + 1;
        convertedTween.fullRotations = tween.rotations;
        convertedTween.easingType = {
            'None': 'none',
            'In': 'in',
            'Out': 'out',
            'InOut': 'in-out',
        }[tween.tweenDir];

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
        var paperPath = paper.project.importSVG(path.pathData);
        paperPath.position.x = path.x;
        paperPath.position.y = path.y;

        var pathJSON = paperPath.children[0].exportJSON({asString:false});
        var convertedPath = new Wick.Path(pathJSON);
        return convertedPath;
    }

    /**
     * Converts a Wick v15.2 WickObject object into a Wick 1.0 Wick.Path object.
     */
    static convertImage (image, convertedProject) {
        // Find asset in convertedProject asset library
        var asset = convertedProject.getAsset(image.assetUUID);

        // Create instance of that asset
        var convertedImage = asset.createInstance();
        convertedImage.paperPath.position.x = image.x;
        convertedImage.paperPath.position.y = image.y;
        convertedImage.paperPath.rotation = image.rotation;
        convertedImage.paperPath.scaling.x = image.scaleX;
        convertedImage.paperPath.scaling.y = image.scaleY;
        return convertedImage;
    }

    /**
     * Converts a Wick v15.2 WickObject object into a Wick 1.0 Wick.Text object.
     */
    static convertText (text) {
        var paperText = new paper.PointText();
        paperText.content = text.textData.text;
        paperText.fillColor = text.textData.fill;
        paperText.fontFamily = text.textData.fontFamily;
        paperText.fontWeight = text.textData.fontWeight;
        paperText.fontSize = text.textData.fontSize;
        paperText.justification = text.textData.textAlign;
        paperText.position.x = text.x;
        paperText.position.y = text.y;
        paperText.rotation = text.rotation;
        paperText.scaling.x = text.scaleX;
        paperText.scaling.y = text.scaleY;

        var convertedTextData = paperText.exportJSON({asString:false});
        var convertedText = new Wick.Path(convertedTextData);
        return convertedText;
    }

    /**
     * Converts a string representing a Wick v15.2 script into a Wick 1.0 list of scripts.
     * @param string} script - The script of the original Wick 15.2 object
     * @returns {array} - An array of objects with the format {src: string, name: string}
     */
    static convertScript (script) {
        // Generate syntax tree.
        let tree = esprima.parseScript(script, {range: true, comment: true, tolerant: true});

        let loadElements = [];
        let eventElements = [];

        let events = [
            'update',
            'load',
            'mouseEnter',
            'mouseLeave',
            'mousePressed',
            'mouseDown',
            'mouseReleased', 
            'mouseHover',
            'keyPressed',
            'keyReleased',
            'keyDown',
        ];

        // Find all event elements an separate from the other objects.
        if (tree.type === "Program") {
            tree.body.forEach(elem => {
                if (elem.type === "FunctionDeclaration" && events.indexOf(elem.id.name) > -1) {
                    eventElements.push(elem);
                } else {
                    loadElements.push(elem);
                }
            });
        }

        let loadScript = "";

        // Pull out all non-event elements and shove them into the load script.
        loadElements.forEach(elem => {
            if ("body" in elem) {
                var range = elem.body.range;
            } else {
                var range = elem.range;
            }

            let s = script.slice(range[0], range[1]);
            loadScript += s;
        });

        let loadObject = {
            name: 'load',
            src: loadScript,
        };

        // Separate all script text from events and build Editor 1.0 objects for them.
        let eventScripts = []

        // Only add load scripts if we need them.
        if (loadScript !== '') {
            eventScripts.push(loadObject);
        }

        eventElements.forEach(elem => {
            let range = elem.body.range;

            let id = elem.id.name.toLowerCase();

            // Remove first and last character to remove { } from functions. Trim off excess white space.
            let eventScript = script.slice(range[0] + 1, range[1] - 1).trim();

            let obj = {
                name: id,
                src: eventScript,
            }

            eventScripts.push(obj);
        });

        return eventScripts;
    }
}
