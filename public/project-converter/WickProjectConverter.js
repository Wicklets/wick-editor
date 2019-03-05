// Wick Alpha 15.2 -> Wick Bagel 1.0 project converter

function convertProjectFile (projectFile, callback) {
    var reader = new FileReader();
    var filename = projectFile.name;
    reader.onload = function(e) {
        var arrayBuffer = reader.result;
        var byteArray = new Uint8Array(arrayBuffer);
        var wickProjectJSON = LZString.decompressFromUint8Array(byteArray);
        
        var project = WickProject.fromJSON(wickProjectJSON);
        var filenameParts = filename.split('-');
        var name = filenameParts[0];
        if(name.includes('.json')) {
            name = name.split('.json')[0];
        }
        if(name.includes('.wick')) {
            name = name.split('.wick')[0];
        }
        project.name = name || 'New Project';

        convertProject(project, callback);
    };
    reader.readAsArrayBuffer(projectFile);
}

function convertProject (project, callback) {
    console.log(project);

    var converted = new Wick.Project();
    converted.root.timeline.layers[0].remove();

    // Project settings
    converted.backgroundColor = project.backgroundColor;
    converted.framerate = project.framerate;
    converted.width = project.width;
    converted.height = project.height;

    // Asset library


    // Root clip
    

    callback(converted);
}
