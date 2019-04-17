describe('Wick.View.Project', function() {
    describe('#pan', function () {
        it('should convert project pan to paper pan correctly', function () {
            var project = new Wick.Project();
            project.pan = {x: 0, y: 0};
            project.view.render();

            expect(project.pan.x).to.equal(0);
            expect(project.pan.y).to.equal(0);
            expect(project.view.pan.x).to.equal(0);
            expect(project.view.pan.y).to.equal(0);

            // pan sent to canvases
            expect(project.view._pan.x).to.equal(-project.width/2);
            expect(project.view._pan.y).to.equal(-project.height/2);

            var clip = new Wick.Clip();
            project.activeFrame.addClip(clip);
            project.focus = clip;

            project.view.render();

            expect(project.pan.x).to.equal(0);
            expect(project.pan.y).to.equal(0);
            expect(project.view.pan.x).to.equal(0);
            expect(project.view.pan.y).to.equal(0);

            // pan sent to canvases
            expect(project.view._pan.x).to.equal(0);
            expect(project.view._pan.y).to.equal(0);
        });
    });

    describe('#render (svg)', function () {
        it('should call render() with blank project without errors', function() {
            var project = new Wick.Project();
            project.activeFrame.remove();
            project.view.render();
        });

        it('should call render() with new project without errors', function() {
            var project = new Wick.Project();
            project.view.render();
        });

        it('should call render() with empty layer without errors', function() {
            var project = new Wick.Project();
            project.root.timeline.addLayer(new Wick.Layer());
            project.root.timeline.activeLayerIndex = 1;
            project.view.render();
        });

        it('background color should be default if inside root', function() {
            var project = new Wick.Project();
            project.view.render();
            expect(project.view.canvas.style.backgroundColor).to.equal(Wick.View.Project.DEFAULT_CANVAS_BG_COLOR);
        });

        it('background color should be a custom color if inside root and a custom color was given', function() {
            var project = new Wick.Project();
            project.view.canvasBGColor = 'rgb(255,0,0)';
            project.view.render();
            expect(project.view.canvas.style.backgroundColor).to.equal('rgb(255, 0, 0)');
        });

        it('background color should be project background color if not inside root', function() {
            var project = new Wick.Project();
            project.backgroundColor = 'rgb(255, 0, 0)';

            var clip = new Wick.Clip();
            project.root.timeline.layers[0].frames[0].addClip(clip);
            project.focus = clip;
            clip.timeline.addLayer(new Wick.Layer());

            project.view.render();

            expect(project.view.canvas.style.backgroundColor).to.equal('rgb(255, 0, 0)');
        });

        it('should create background layer for root correctly', function() {
        	var project = new Wick.Project();
            project.view.render();

            expect(project.view._svgBackgroundLayer instanceof paper.Layer).to.equal(true);
            expect(project.view._svgBackgroundLayer.children.length).to.equal(1);
            expect(project.view._svgBackgroundLayer.children[0].fillColor.toCSS(true)).to.equal(project.backgroundColor);
            expect(project.view._svgBackgroundLayer.children[0].bounds.width).to.equal(project.width);
            expect(project.view._svgBackgroundLayer.children[0].bounds.height).to.equal(project.height);

            project.width = 100;
            project.height = 200;
            project.backgroundColor = '#ff0000';
            project.view.render(project);

            expect(project.view._svgBackgroundLayer instanceof paper.Layer).to.equal(true);
            expect(project.view._svgBackgroundLayer.children.length).to.equal(1);
            expect(project.view._svgBackgroundLayer.children[0].fillColor.toCSS(true)).to.equal(project.backgroundColor);
            expect(project.view._svgBackgroundLayer.children[0].bounds.width).to.equal(project.width);
            expect(project.view._svgBackgroundLayer.children[0].bounds.height).to.equal(project.height);
        });

        it('should create background layer for non-root correctly', function() {
        	var project = new Wick.Project();
            var clip = new Wick.Clip();
            project.root.timeline.layers[0].frames[0].addClip(clip);
            project.focus = clip;

            project.view.render(project);
            expect(project.view._svgBackgroundLayer.children.length).to.equal(1);
            expect(project.view._svgBackgroundLayer.children[0] instanceof paper.Group).to.equal(true);
            expect(project.view._svgBackgroundLayer.children[0].bounds.x).to.equal(-Wick.View.Project.ORIGIN_CROSSHAIR_SIZE);
            expect(project.view._svgBackgroundLayer.children[0].bounds.y).to.equal(-Wick.View.Project.ORIGIN_CROSSHAIR_SIZE);
            expect(project.view._svgBackgroundLayer.children[0].bounds.width).to.equal(2*Wick.View.Project.ORIGIN_CROSSHAIR_SIZE);
            expect(project.view._svgBackgroundLayer.children[0].bounds.height).to.equal(2*Wick.View.Project.ORIGIN_CROSSHAIR_SIZE);
        });

        it('should create layers correctly for populated project', function() {
            var project = new Wick.Project();
            project.view.render();

            expect(paper.project.layers[0].name).to.equal('wick_project_bg');
            expect(paper.project.layers[1].data.wickUUID).to.equal(project.activeFrame.uuid);
            expect(paper.project.layers[2].data.wickUUID).to.equal(project.activeFrame.uuid);
        });

        it('should create layers correctly for focused clip', function() {
            var project = new Wick.Project();
            var clip = new Wick.Clip();
            project.root.timeline.layers[0].frames[0].addClip(clip);
            project.focus = clip;

            clip.timeline.addLayer(new Wick.Layer());
            clip.timeline.layers[0].addFrame(new Wick.Frame());

            project.view.render(project);
            expect(paper.project.layers[1].data.wickUUID).to.equal(clip.activeFrame.uuid);
            expect(paper.project.layers[2].data.wickUUID).to.equal(clip.activeFrame.uuid);
        });

        it('should focus correct layer', function() {
            var project = new Wick.Project();
            project.view.render();
            expect(paper.project.activeLayer.data.wickUUID).to.equal(project.activeFrame.uuid);
            expect(paper.project.activeLayer.data.wickType).to.equal('paths');
        });

        it('should focus background layer if there is no active frame', function() {
            var project = new Wick.Project();
            project.focus.timeline.playheadPosition = 2;
            project.view.render();
            expect(paper.project.activeLayer.id).to.equal(project.view._svgBackgroundLayer.id);
        });
    });

    describe('#destroy', function () {
        it('should call destroy() without errors', function () {
            var project = new Wick.Project();
            project.view.renderMode = 'webgl';
            project.view.render();
            project.view.destroy();
        });
    });

    describe('#render (webgl)', function () {
        it('should call render() with blank project without errors', function() {
            var project = new Wick.Project();
            project.view.renderMode = 'webgl';
            project.view.render();
            project.view.destroy();
        });

        it('background color should be default if inside root', function() {
            var project = new Wick.Project();
            project.view.renderMode = 'webgl';
            project.view.render();
            expect(project.view.canvas.style.backgroundColor).to.equal(Wick.View.Project.DEFAULT_CANVAS_BG_COLOR);

            project.view.destroy();
        });

        it('background color should be a custom color if inside root and a custom color was given', function() {
            var project = new Wick.Project();
            project.view.renderMode = 'webgl';
            project.view.canvasBGColor = 'rgb(255,0,0)';
            project.view.render();
            expect(project.view.canvas.style.backgroundColor).to.equal('rgb(255, 0, 0)');

            project.view.destroy();
        });

        it('background color should be project background color if not inside root', function() {
            var project = new Wick.Project();
            project.view.renderMode = 'webgl';
            project.backgroundColor = 'rgb(255, 0, 0)';

            var clip = new Wick.Clip();
            project.root.timeline.layers[0].frames[0].addClip(clip);
            project.focus = clip;
            clip.timeline.addLayer(new Wick.Layer());

            project.view.render();

            expect(project.view.canvas.style.backgroundColor).to.equal('rgb(255, 0, 0)');

            project.view.destroy();
        });

        it('should create containers correctly for populated project', function() {
            var project = new Wick.Project();
            project.view.renderMode = 'webgl';
            project.view.render();

            // TODO
            /*
            expect(paper.project.layers[0].name).to.equal('wick_project_bg');
            expect(paper.project.layers[1]._wickDebugData.wickUUID).to.equal(project.activeFrame.uuid);
            expect(paper.project.layers[2]._wickDebugData.wickUUID).to.equal(project.activeFrame.uuid);
            */

            project.view.destroy();
        });

        it('should create containers correctly for focused clip', function() {
            var project = new Wick.Project();
            project.view.renderMode = 'webgl';

            var clip = new Wick.Clip();
            project.root.timeline.layers[0].frames[0].addClip(clip);
            project.focus = clip;

            clip.timeline.addLayer(new Wick.Layer());
            clip.timeline.layers[0].addFrame(new Wick.Frame());

            // TODO
            /*
            project.view.render(project);
            expect(paper.project.layers[1]._wickDebugData.wickUUID).to.equal(clip.activeFrame.uuid);
            expect(paper.project.layers[2]._wickDebugData.wickUUID).to.equal(clip.activeFrame.uuid);
            */

            project.view.destroy();
        });
    });

    describe('#prerasterize', function () {
        it('should preload all rastered SVG textures', function (done) {
            var project = new Wick.Project();
            project.activeLayer.addFrame(new Wick.Frame(2));
            project.activeLayer.addFrame(new Wick.Frame(3));
            project.activeLayer.addFrame(new Wick.Frame(4));

            var frame1 = project.activeLayer.frames[0];
            var frame2 = project.activeLayer.frames[1];
            var frame3 = project.activeLayer.frames[2];
            var frame4 = project.activeLayer.frames[3];

            frame1.addPath(new Wick.Path(new paper.Path.Circle({
                center: [0, 0],
                radius: 30,
                strokeColor: 'black',
                fillColor: 'red',
            }).exportJSON()));
            frame2.addPath(new Wick.Path(new paper.Path.Circle({
                center: [0, 0],
                radius: 30,
                strokeColor: 'black',
                fillColor: 'blue',
            }).exportJSON()));
            frame3.addPath(new Wick.Path(new paper.Path.Circle({
                center: [0, 0],
                radius: 30,
                strokeColor: 'black',
                fillColor: 'green',
            }).exportJSON()));

            project.view.prerasterize(() => {
                project.view.render();

                var sprite1 = frame1.view.pathsContainer.children[0];
                expect(sprite1.texture.width).to.equal(62 * Wick.View.Frame.RASTERIZE_RESOLUTION_MODIFIER);
                expect(sprite1.texture.height).to.equal(62 * Wick.View.Frame.RASTERIZE_RESOLUTION_MODIFIER);

                var sprite2 = frame2.view.pathsContainer.children[0];
                expect(sprite2.texture.width).to.equal(62 * Wick.View.Frame.RASTERIZE_RESOLUTION_MODIFIER);
                expect(sprite2.texture.height).to.equal(62 * Wick.View.Frame.RASTERIZE_RESOLUTION_MODIFIER);

                var sprite3 = frame3.view.pathsContainer.children[0];
                expect(sprite3.texture.width).to.equal(62 * Wick.View.Frame.RASTERIZE_RESOLUTION_MODIFIER);
                expect(sprite3.texture.height).to.equal(62 * Wick.View.Frame.RASTERIZE_RESOLUTION_MODIFIER);

                project.view.destroy();

                done();
            });
        });
    });

    describe('#canvasContainer', function () {
        it('should add canvas to a given element', function () {
            var project1 = new Wick.Project();
            var project2 = new Wick.Project();

            var canvasContainer1 = document.createElement('div');
            var canvasContainer2 = document.createElement('div');

            project1.view.canvasContainer = canvasContainer1;
            project1.view.render();
            expect(canvasContainer1.children.length).to.equal(1);
            expect(project1.view.canvas).to.equal(canvasContainer1.children[0]);

            project1.view.canvasContainer = canvasContainer2;
            project1.view.render();
            expect(canvasContainer1.children.length).to.equal(0);
            expect(canvasContainer2.children.length).to.equal(1);
            expect(project1.view.canvas).to.equal(canvasContainer2.children[0]);

            project2.view.canvasContainer = canvasContainer2;
            project2.view.render();
            expect(canvasContainer1.children.length).to.equal(0);
            expect(canvasContainer2.children.length).to.equal(1);
            expect(project2.view.canvas).to.equal(canvasContainer2.children[0]);
        });

        it('should hotswap between webgl and svg automatically', function () {
            var project = new Wick.Project();
            project.view.canvasContainer = document.createElement('div');

            var clip = new Wick.Clip();
            var path = new paper.Path.Circle({
                center: [0, 0],
                radius: 30,
                strokeColor: 'black',
                fillColor: 'purple',
            });
            clip.activeFrame.addPath(new Wick.Path(path.exportJSON()));
            project.activeFrame.addClip(clip);

            // Start in svg mode
            project.view.renderMode = 'svg';
            project.view.render();
            expect(project.view.canvasContainer.children.length).to.equal(1);
            expect(project.view.canvasContainer.children[0]).to.equal(project.view._svgCanvas);

            // Switch to webgl mode
            project.view.renderMode = 'webgl';
            project.view.render();
            expect(project.view.canvasContainer.children.length).to.equal(1);
            expect(project.view.canvasContainer.children[0]).to.equal(project.view._webGLCanvas);

            // Switch back to svg mode
            project.view.renderMode = 'svg';
            project.view.render();
            expect(project.view.canvasContainer.children.length).to.equal(1);
            expect(project.view.canvasContainer.children[0]).to.equal(project.view._svgCanvas);

            project.view.destroy();
        });
    });

    describe('#tools', function () {
        it('should instantiate all tools', function () {
            var project = new Wick.Project();
            expect(project.view.tools.brush instanceof Wick.Tools.Brush).to.equal(true);
            expect(project.view.tools.cursor instanceof Wick.Tools.Cursor).to.equal(true);
            expect(project.view.tools.ellipse instanceof Wick.Tools.Ellipse).to.equal(true);
            expect(project.view.tools.eraser instanceof Wick.Tools.Eraser).to.equal(true);
            expect(project.view.tools.eyedropper instanceof Wick.Tools.Eyedropper).to.equal(true);
            expect(project.view.tools.fillbucket instanceof Wick.Tools.FillBucket).to.equal(true);
            expect(project.view.tools.line instanceof Wick.Tools.Line).to.equal(true);
            expect(project.view.tools.none instanceof Wick.Tools.None).to.equal(true);
            expect(project.view.tools.pan instanceof Wick.Tools.Pan).to.equal(true);
            expect(project.view.tools.pencil instanceof Wick.Tools.Pencil).to.equal(true);
            expect(project.view.tools.rectangle instanceof Wick.Tools.Rectangle).to.equal(true);
            expect(project.view.tools.text instanceof Wick.Tools.Text).to.equal(true);
            expect(project.view.tools.zoom instanceof Wick.Tools.Zoom).to.equal(true);
        });
    });
});
