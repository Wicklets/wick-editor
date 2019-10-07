describe('Wick.Tools.FillBucket', function() {
    it('should activate without errors', function() {
        var project = new Wick.Project();
        project.tools.fillbucket.activate();
    });

    /*
    it('Should change fill color of path', function(done) {
        var project = new Wick.Project();
        var fillbucket = project.tools.fillbucket;

        var json1 = ["Path",{"segments":[[0,0],[50,0],[50,50],[0,50]],"closed":true,"fillColor":[1,1,1]}];
        var json2 = ["Path",{"segments":[[50,50],[100,50],[100,100],[50,100]],"closed":true,"fillColor":[1,1,1]}];

        var path1 = new Wick.Path({json:json1});
        var path2 = new Wick.Path({json:json2});
        project.activeFrame.addPath(path1);
        project.activeFrame.addPath(path2);
        project.view.render();

        project.view.on('canvasModified', function (e) {
            expect(project.activeFrame.paths.length).to.equal(2);
            expect(project.activeFrame.paths[0].view.item.fillColor.toCSS(true)).to.equal('#ff0000');
        });

        fillbucket.activate();
        project.toolSettings.setSetting('fillColor', '#ff0000');
        fillbucket.onMouseDown({point: new paper.Point(25,25), modifiers: {}});

        project.view.on('canvasModified', function (e) {
            expect(project.activeFrame.paths.length).to.equal(2);
            expect(project.activeFrame.paths[0].view.item.fillColor.toCSS(true)).to.equal('#ff0000');
            expect(project.activeFrame.paths[1].view.item.fillColor.toCSS(true)).to.equal('#0000ff');
            done();
        });
        project.toolSettings.setSetting('fillColor', '#0000ff');
        fillbucket.onMouseDown({point: new paper.Point(75,75), modifiers: {}});
    });
    */

    it('Should fill a hole made by a few paths', function(done) {
        var project = new Wick.Project();
        var fillbucket = project.tools.fillbucket;

        project.view.on('canvasModified', function (e) {
            expect(project.activeFrame.paths.length).to.equal(5);
            expect(project.activeFrame.paths[4].view.item.fillColor.toCSS(true)).to.equal('#ff0000');
            expect(project.activeFrame.paths[4].view.item.bounds.width).to.be.closeTo(30, 10);
            expect(project.activeFrame.paths[4].view.item.bounds.height).to.be.closeTo(30, 10);
            done();
        });

        var json1 = ["Path",{"segments":[[0,0],[50,0],[50,10],[0,10]],"closed":true,"fillColor":[255,0,0]}];
        var json2 = ["Path",{"segments":[[0,0],[10,0],[10,50],[0,50]],"closed":true,"fillColor":[255,0,0]}]
        var json3 = ["Path",{"segments":[[40,0],[50,0],[50,50],[40,50]],"closed":true,"fillColor":[255,0,0]}]
        var json4 = ["Path",{"segments":[[0,40],[50,40],[50,50],[0,50]],"closed":true,"fillColor":[255,0,0]}]

        var path1 = new Wick.Path({json: json1});
        var path2 = new Wick.Path({json: json2});
        var path3 = new Wick.Path({json: json3});
        var path4 = new Wick.Path({json: json4});
        project.activeFrame.addPath(path1);
        project.activeFrame.addPath(path2);
        project.activeFrame.addPath(path3);
        project.activeFrame.addPath(path4);
        project.view.render();

        fillbucket.activate();
        project.toolSettings.setSetting('fillColor', '#ff0000');
        fillbucket.onMouseDown({point: new paper.Point(15,15), modifiers: {}});
    });

    it('Should fill an existing shape', function(done) {
        var project = new Wick.Project();
        var fillbucket = project.tools.fillbucket;

        project.view.on('canvasModified', function (e) {
            expect(project.activeFrame.paths.length).to.equal(6);
            expect(project.activeFrame.paths[5].view.item.fillColor.toCSS(true)).to.equal('#ff0000');
            expect(project.activeFrame.paths[5].view.item.bounds.width).to.be.closeTo(10, 2);
            expect(project.activeFrame.paths[5].view.item.bounds.height).to.be.closeTo(10, 2);
            done();
        });

        var json1 = ["Path",{"segments":[[0,0],[50,0],[50,10],[0,10]],"closed":true,"fillColor":[255,0,0]}];
        var json2 = ["Path",{"segments":[[0,0],[10,0],[10,50],[0,50]],"closed":true,"fillColor":[255,0,0]}]
        var json3 = ["Path",{"segments":[[40,0],[50,0],[50,50],[40,50]],"closed":true,"fillColor":[255,0,0]}]
        var json4 = ["Path",{"segments":[[0,40],[50,40],[50,50],[0,50]],"closed":true,"fillColor":[255,0,0]}]
        var json5 = ["Path",{"segments":[[20,20],[30,20],[30,30],[20,30]],"closed":true,"fillColor":[255,0,0]}]

        var path1 = new Wick.Path({json: json1});
        var path2 = new Wick.Path({json: json2});
        var path3 = new Wick.Path({json: json3});
        var path4 = new Wick.Path({json: json4});
        var path5 = new Wick.Path({json: json5});
        project.activeFrame.addPath(path1);
        project.activeFrame.addPath(path2);
        project.activeFrame.addPath(path3);
        project.activeFrame.addPath(path4);
        project.activeFrame.addPath(path5);
        project.view.render();

        fillbucket.activate();
        project.toolSettings.setSetting('fillColor', '#ff0000');
        fillbucket.onMouseDown({point: new paper.Point(25,25), modifiers: {}});
    });
});
