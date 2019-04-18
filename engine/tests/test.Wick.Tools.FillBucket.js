describe('Wick.Tools.FillBucket', function() {
    it('should activate without errors', function() {
        var project = new Wick.Project();
        project.view.tools.fillbucket.activate();
    });

    it('Should change fill color of path', function(done) {
        var project = new Wick.Project();
        var fillbucket = project.view.tools.fillbucket;

        var path1 = new Wick.Path(["Path",{"segments":[[0,0],[50,0],[50,50],[0,50]],"closed":true,"fillColor":[1,1,1]}]);
        var path2 = new Wick.Path(["Path",{"segments":[[50,50],[100,50],[100,100],[50,100]],"closed":true,"fillColor":[1,1,1]}]);
        project.activeFrame.addPath(path1);
        project.activeFrame.addPath(path2);
        project.view.render();

        project.view.on('canvasModified', function (e) {
            expect(project.activeFrame.paths.length).to.equal(2);
            expect(project.activeFrame.paths[0].paperPath.fillColor.toCSS(true)).to.equal('#ff0000');
        });

        fillbucket.activate();
        fillbucket.fillColor = '#ff0000';
        fillbucket.onMouseDown({point: new paper.Point(25,25), modifiers: {}});

        project.view.on('canvasModified', function (e) {
            expect(project.activeFrame.paths.length).to.equal(2);
            expect(project.activeFrame.paths[0].paperPath.fillColor.toCSS(true)).to.equal('#ff0000');
            expect(project.activeFrame.paths[1].paperPath.fillColor.toCSS(true)).to.equal('#0000ff');
            done();
        });
        fillbucket.fillColor = '#0000ff';
        fillbucket.onMouseDown({point: new paper.Point(75,75), modifiers: {}});
    });

    it('Should fill a hole made by a few paths', function(done) {
        var project = new Wick.Project();
        var fillbucket = project.view.tools.fillbucket;

        project.view.on('canvasModified', function (e) {
            expect(project.activeFrame.paths.length).to.equal(5);
            expect(project.activeFrame.paths[4].paperPath.fillColor.toCSS(true)).to.equal('#ff0000');
            expect(project.activeFrame.paths[4].paperPath.bounds.area).to.be.closeTo(900, 100);
            done();
        });

        var path1 = new Wick.Path(["Path",{"segments":[[0,0],[50,0],[50,10],[0,10]],"closed":true,"fillColor":[1,1,1]}]);
        var path2 = new Wick.Path(["Path",{"segments":[[0,0],[10,0],[10,50],[0,50]],"closed":true,"fillColor":[1,1,1]}]);
        var path3 = new Wick.Path(["Path",{"segments":[[40,0],[50,0],[50,50],[40,50]],"closed":true,"fillColor":[1,1,1]}]);
        var path4 = new Wick.Path(["Path",{"segments":[[0,40],[50,40],[50,50],[0,50]],"closed":true,"fillColor":[1,1,1]}]);
        project.activeFrame.addPath(path1);
        project.activeFrame.addPath(path2);
        project.activeFrame.addPath(path3);
        project.activeFrame.addPath(path4);
        project.view.render();

        fillbucket.activate();
        fillbucket.fillColor = '#ff0000';
        fillbucket.onMouseDown({point: new paper.Point(25,25), modifiers: {}});
    });
});
