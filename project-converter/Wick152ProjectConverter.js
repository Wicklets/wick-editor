/*
 * Utility class to convert Wick Alpha 15.2 projects into Wick 1.0 (Bagel) projects.
 */
class Wick152ProjectConverter {
    /**
     * Converts a Wick v15.2 project file (html, zip, or wick) into a Wick 1.0 project.
     */
    static convertWick152Project (file, callback) {
        if(file.type === 'text/html') {
            Wick152ProjectConverter.convertOldWickHTML(file, callback);
        } else if (file.type === '') {
            Wick152ProjectConverter.convertOldWickFile(file, callback);
        } else {
            console.error('Could not convert project. No conversion routine for ' + file.type);
        }
    }

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
        WickProject.fromFile(htmlFile, project => {
            callback(Wick152ProjectConverter.convertProject(project));
        });
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
            callback(Wick152ProjectConverter.convertProject(project));
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
            var asset = Wick152ProjectConverter.convertAsset(project.library.assets[key]);
            convertedProject.addAsset(asset);
        }

        // Root clip
        convertedProject.root = Wick152ProjectConverter.convertClip(project.rootObject, convertedProject);
        convertedProject.focus = convertedProject.root;

        return convertedProject;
    }

    /**
     * Converts a Wick v15.2 WickAsset object into a Wick 1.0 Wick.Asset object.
     */
    static convertAsset (asset) {
        if(asset.type === 'image') {
            // Image asset
            return Wick152ProjectConverter.convertImageAsset(asset);
        } else if (asset.type === 'audio') {
            // Sound asset
            return Wick152ProjectConverter.convertSoundAsset(asset);
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
        var convertedImageAsset = new Wick.ImageAsset({
            filename: imageAsset.filename,
            src: src
        });
        convertedImageAsset._uuid = imageAsset.uuid;
        convertedImageAsset.src = src; // To force WickFileCache to update with manually changed UUID.
        return convertedImageAsset;
    }

    /**
     * Converts a Wick v15.2 WickAsset object into a Wick 1.0 Wick.SoundAsset object.
     */
    static convertSoundAsset (soundAsset) {
        var src = soundAsset.getData();
        var convertedSoundAsset = new Wick.SoundAsset({
            filename: soundAsset.filename,
            src: src
        });
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
        convertedClip.transformation.x = clip.x;
        convertedClip.transformation.y = clip.y;
        convertedClip.transformation.scaleX = clip.scaleX;
        convertedClip.transformation.scaleY = clip.scaleY;
        convertedClip.transformation.rotation = clip.rotation;
        convertedClip.transformation.opacity = clip.opacity;

        // Clip script
        Wick152ProjectConverter.convertScript(clip.wickScript).forEach(script => {
            convertedClip.addScript(script.name, script.src);
        });

        // Layers
        clip.layers.forEach(layer => {
            var convertedLayer = Wick152ProjectConverter.convertLayer(layer, convertedProject);
            convertedClip.timeline.addLayer(convertedLayer);
        });

        return convertedClip;
    }

    /**
     * Converts a Wick v15.2 WickObject object into a Wick 1.0 Wick.Button object.
     */
    static convertButton (button, convertedProject) {
        var convertedButton = Wick152ProjectConverter.convertClip(button, convertedProject, 'Button');
        return convertedButton;
    }

    /**
     * Converts a Wick v15.2 WickLayer object into a Wick 1.0 Wick.Layer object.
     */
    static convertLayer (layer, convertedProject) {
        var convertedLayer = new Wick.Layer();

        // Layer attributes
        convertedLayer.name = layer.identifier;
        convertedLayer.identifier = layer.identifier;

        convertedLayer.locked = layer.locked;
        convertedLayer.hidden = layer.hidden;

        // Frames
        layer.frames.forEach(frame => {
            var convertedFrame = Wick152ProjectConverter.convertFrame(frame, convertedProject);
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

        // Attempt to convert frame names to valid variable names.

        console.log("Frame Name", frame.name);

        if (frame.name !== "New Frame") {
            let splitFrameName = frame.name.split(/[ ,]+/);
            let pieces = [];
            splitFrameName.forEach ( str => {
                let cleanString = str.replace(/\W/g, ''); // Remove non alpha-numeric characters
                let upperString = cleanString.charAt(0).toUpperCase() + cleanString.slice(1); // Capitalize first letter.
                pieces.push( upperString ); 
             }); 
    
            var finalFrameName = pieces.join("");
            // Determine if first character is legal
            let re = RegExp("[a-zA-Z_]"); 

            console.log("Final Frame Name: ", finalFrameName);
            if (!re.test(finalFrameName.charAt(0))) {
                console.log("TestedPositive");
                finalFrameName = "_" + finalFrameName; 
            }
        } else {
            var finalFrameName = '';
        }

        console.log("Converted to:", finalFrameName); 

        convertedFrame.identifier = finalFrameName;
        convertedFrame.start = frame.playheadPosition + 1;
        convertedFrame.end = frame.playheadPosition + frame.length;
        convertedFrame._soundAssetUUID = frame.audioAssetUUID;

        // Frame script
        Wick152ProjectConverter.convertScript(frame.wickScript).forEach(script => {
            convertedFrame.addScript(script.name, script.src);
        });

        // Wick objects
        frame.wickObjects.forEach(wickObject => {
            if(wickObject.isPath) {
                // Path
                var convertedPath = Wick152ProjectConverter.convertPath(wickObject);
                if(convertedPath)
                    convertedFrame.addPath(convertedPath);
            } else if(wickObject.isText) {
                // Text
                var convertedText = Wick152ProjectConverter.convertText(wickObject);
                convertedFrame.addPath(convertedText);
            } else if (wickObject.isImage) {
                // Image
                var convertedImage = Wick152ProjectConverter.convertImage(wickObject, convertedProject);
                convertedFrame.addPath(convertedImage);
            } else if (wickObject.isButton) {
                // Button
                var convertedButton = Wick152ProjectConverter.convertButton(wickObject, convertedProject);
                convertedFrame.addClip(convertedButton);
            } else if (wickObject.isClip || wickObject.isGroup || wickObject.isSymbol) {
                // Clip
                var convertedClip = Wick152ProjectConverter.convertClip(wickObject, convertedProject);
                convertedFrame.addClip(convertedClip);
            } else {
                console.warn("Couldn't convert a wick object, did you forget a case?");
                console.warn(wickObject);
            }
        });

        // Tweens
        frame.tweens.forEach(tween => {
            var convertedTween = Wick152ProjectConverter.convertTween(tween);
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
        convertedTween.transformation.x = tween.x;
        convertedTween.transformation.y = tween.y;
        convertedTween.transformation.scaleX = tween.scaleX;
        convertedTween.transformation.scaleY = tween.scaleY;
        convertedTween.transformation.rotation = tween.rotation;
        convertedTween.transformation.opacity = tween.opacity;

        return convertedTween;
    }

    /**
     * Converts a Wick v15.2 WickObject object into a Wick 1.0 Wick.Path object.
     */
    static convertPath (path) {
        var paperPath = paper.project.importSVG(path.pathData);
        paperPath.position.x = path.x;
        paperPath.position.y = path.y;

        var pathJSON = null;
        if(paperPath.children && paperPath.children[0]) {
            pathJSON = paperPath.children[0].exportJSON({asString:false});
        } else {
            pathJSON = paperPath.exportJSON({asString:false});
        }

        var convertedPath = new Wick.Path({json:pathJSON});
        return convertedPath;
    }

    /**
     * Converts a Wick v15.2 WickObject object into a Wick 1.0 Wick.Path object.
     */
    static convertImage (image, convertedProject) {
        // Find asset in convertedProject asset library
        var asset = convertedProject.getAssetByUUID(image.assetUUID);

        // Create instance of that asset
        var convertedImage = Wick.Path.createImagePathSync(asset);
        convertedImage.view.item.position.x = image.x;
        convertedImage.view.item.position.y = image.y;
        convertedImage.view.item.rotation = image.rotation;
        convertedImage.view.item.scaling.x = image.scaleX;
        convertedImage.view.item.scaling.y = image.scaleY;
        convertedImage.json = convertedImage.view.exportJSON();
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
        var convertedText = new Wick.Path({json:convertedTextData});
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

        // Find all event elements and separate from the other objects.
        if (tree.type === "Program") {
            tree.body.forEach(elem => {
                if (elem.type === "FunctionDeclaration" && events.indexOf(elem.id.name) > -1) {
                    eventElements.push(elem);
                } else {
                    loadElements.push(elem);
                }
            });
        }

        let defaultScript = "";

        // Pull out all non-event elements and shove them into the load script.
        loadElements.forEach(elem => {
            if ("body" in elem) {
                var range = elem.body.range;
            } else {
                var range = elem.range;
            }

            let s = script.slice(range[0], range[1]);
            defaultScript += s + "\n";
        });

        eventElements.forEach(elem => {
            let range = elem.body.range;

            let id = elem.id.name.toLowerCase();

            // Remove first and last character to remove { } from functions. Trim off excess white space.
            let eventScript = script.slice(range[0] + 1, range[1] - 1).trim();

            let placeholder = '\n' + "onEvent('<EVENT_NAME>', function () {\n\t<EVENT_SCRIPT>\n});\n";
            let withName = placeholder.replace('<EVENT_NAME>', id);
            let finalScript = withName.replace('<EVENT_SCRIPT>', eventScript)

            defaultScript += finalScript;
        });

        return [{name:"default", src: defaultScript}];
    }
}
