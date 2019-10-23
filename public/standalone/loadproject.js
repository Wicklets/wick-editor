window.onload = function () {
    function handleComplete () {
        var projectData = queue.getResult("project");
        Wick.WickFile.fromWickFile(new Blob([new Uint8Array(projectData)]), project => {
            playProject(project);
        });
    }

    function handleProgress(event) {
        let container = document.getElementById("loading-bar");
        container.innerHTML = "Loading... " + ((event.loaded * 100).toFixed(1)) + '%';
    }

    var queue = new createjs.LoadQueue();
    queue.on("complete", handleComplete, this);
    queue.on("progress", handleProgress, this);
    queue.loadManifest([
        {id: "project", src: "project.wick", type:createjs.Types.BINARY},
        {id: "wickengine", src: "wickengine.js", type:createjs.Types.JAVASCRIPT}
    ]);
}
