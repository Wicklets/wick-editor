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

    function playProject (project) {
        window.project = project;

        document.title = project.name;

        container.innerHTML = '';
        project.view.renderMode = 'webgl';
        project.view.canvasContainer = container;
        project.view.fitMode = 'fill';
        project.view.canvasBGColor = '#000000';

        window.onresize = function () {
            project.view.resize();
        }
        project.view.resize();
        this.project.view.prerender();

        project.focus = project.root;
        project.focus.timeline.playheadPosition = 1;
        
        project.play({
            onAfterTick: (() => {
                project.view.render();
            }),
            onError: (error => {
                console.error('Project threw an error!');
                console.error(error);
            }),
        });
    }

    var container = document.getElementById('wick-canvas-container')
    var queue = new createjs.LoadQueue();
    queue.on("complete", handleComplete, this);
    queue.on("progress", handleProgress, this);
    queue.loadManifest([
        {id: "project", src: "project.wick", type:createjs.Types.BINARY},
        {id: "wickengine", src: "wickengine.js", type:createjs.Types.JAVASCRIPT}
    ]);
}
