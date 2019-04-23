describe('Wick.View.Frame', function() {
    var TEST_IMG_SRC = 'data:image/png;base64,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';

    describe('#render (SVG)', function () {
        it('should call render() with blank frame without errors', function() {
            var project = new Wick.Project();
            var frame = project.activeFrame;
            frame.view.render(frame);
        });

        it('should create paper.js layers without errors', function() {
            var project = new Wick.Project();
            var frame = project.activeFrame;
            frame.view.render(frame);

            expect(frame.view.clipsLayer instanceof paper.Layer).to.equal(true);
            expect(frame.view.pathsLayer instanceof paper.Layer).to.equal(true);

            expect(frame.view.clipsLayer.children.length).to.equal(0);
            expect(frame.view.pathsLayer.children.length).to.equal(0);
        });

        it('should create correctly named layers', function() {
            var project = new Wick.Project();
            var frame = project.activeFrame;
            frame.view.render(frame);

            expect(frame.view.clipsLayer.data.wickUUID).to.equal(frame.uuid);
            expect(frame.view.pathsLayer.data.wickUUID).to.equal(frame.uuid);
        });

        it('should create paper.js layer with SVG from frame SVG', function() {
            var project = new Wick.Project();
            var frame = project.activeFrame;
            frame.addPath(new Wick.Path(new paper.Path({strokeColor:'#ff0000'})));
            frame.addPath(new Wick.Path(new paper.Path({strokeColor:'#0000ff'})));
            frame.addPath(new Wick.Path(new paper.Path({strokeColor:'#00ff00'})));

            frame.view.render(frame);

            expect(frame.view.pathsLayer.children.length).to.equal(3);
            expect(frame.view.pathsLayer.children[0].strokeColor.toCSS(true)).to.equal('#ff0000');
            expect(frame.view.pathsLayer.children[1].strokeColor.toCSS(true)).to.equal('#0000ff');
            expect(frame.view.pathsLayer.children[2].strokeColor.toCSS(true)).to.equal('#00ff00');
        });

        it('should create paper.js layer with layers for groups from frame', function() {
            var project = new Wick.Project();
            var frame = project.activeFrame;

            var clip1 = new Wick.Clip();
            clip1.timeline.addLayer(new Wick.Layer());
            clip1.timeline.layers[0].addFrame(new Wick.Frame());
            clip1.timeline.layers[0].frames[0].addPath(new Wick.Path(new paper.Path({strokeColor:'#ff0000'})));

            var clip2 = new Wick.Clip();
            clip2.timeline.addLayer(new Wick.Layer());
            clip2.timeline.layers[0].addFrame(new Wick.Frame());
            clip2.timeline.layers[0].frames[0].addPath(new Wick.Path(new paper.Path({strokeColor:'#ff0000'})));

            var clip3 = new Wick.Clip();
            clip3.timeline.addLayer(new Wick.Layer());
            clip3.timeline.layers[0].addFrame(new Wick.Frame());
            clip3.timeline.layers[0].frames[0].addPath(new Wick.Path(new paper.Path({strokeColor:'#ff0000'})));

            frame.addClip(clip1);
            frame.addClip(clip2);
            frame.addClip(clip3);

            frame.view.render(frame);

            expect(frame.view.pathsLayer.children.length).to.equal(0);
            expect(frame.view.clipsLayer.children.length).to.equal(3);
        });

        it('should create groups with correct placement from clips', function() {
            var project = new Wick.Project();
            var frame = project.activeFrame;

            var clip = new Wick.Clip();
            clip.timeline.addLayer(new Wick.Layer());
            clip.timeline.layers[0].addFrame(new Wick.Frame());
            clip.timeline.layers[0].frames[0].addPath(new Wick.Path(new paper.Path({
                segments: [[0,0], [0,100], [100,100], [100,0]],
                fillColor: 'black',
            }).exportJSON({asString:false})));
            clip.transformation.x = 100;
            frame.addClip(clip);

            var button = new Wick.Button();
            button.timeline.addLayer(new Wick.Layer());
            button.timeline.layers[0].addFrame(new Wick.Frame());
            button.timeline.layers[0].frames[0].addPath(new Wick.Path(new paper.Path({
                segments: [[0,0], [0,100], [100,100], [100,0]],
                fillColor: 'black',
            }).exportJSON({asString:false})));
            button.transformation.x = 200;
            frame.addClip(button);

            frame.addPath(new Wick.Path(new paper.Path({
                segments: [[0,0], [0,100], [100,100], [100,0]],
                fillColor: 'black',
            }).exportJSON({asString:false})));

            frame.view.render(frame);

            expect(frame.view.pathsLayer.children[0].bounds.x).to.equal(0);
            expect(frame.view.pathsLayer.children[0].bounds.y).to.equal(0);
            expect(frame.view.pathsLayer.children[0].bounds.width).to.equal(100);
            expect(frame.view.pathsLayer.children[0].bounds.height).to.equal(100);

            expect(frame.view.clipsLayer.children[0].bounds.x).to.equal(100);
            expect(frame.view.clipsLayer.children[0].bounds.y).to.equal(0);
            expect(frame.view.clipsLayer.children[0].bounds.width).to.equal(100);
            expect(frame.view.clipsLayer.children[0].bounds.height).to.equal(100);

            expect(frame.view.clipsLayer.children[1].bounds.x).to.equal(200);
            expect(frame.view.clipsLayer.children[1].bounds.y).to.equal(0);
            expect(frame.view.clipsLayer.children[1].bounds.width).to.equal(100);
            expect(frame.view.clipsLayer.children[1].bounds.height).to.equal(100);
        });

        it('should render rasters', function(done) {
            var project = new Wick.Project();
            var frame = project.activeFrame;
            var asset = new Wick.ImageAsset('test.png', TEST_IMG_SRC);
            project.addAsset(asset);

            var path = new Wick.Path(["Raster",{"applyMatrix":false,"crossOrigin":"","source":"asset","asset":asset.uuid}]);
            path.paperPath.position.x = 50;
            frame.addPath(path);

            project.view.preloadImages(() => {
                project.view.render();
                expect(frame.view.pathsLayer.children[0].bounds.width).to.equal(100);
                expect(frame.view.pathsLayer.children[0].bounds.height).to.equal(100);
                expect(frame.view.pathsLayer.children[0].source).to.equal(TEST_IMG_SRC);
                expect(frame.view.pathsLayer.children[0].position.x).to.equal(50);
                expect(frame.view.pathsLayer.children[0].position.y).to.equal(0);
                done();
            });
        });
    });

    describe('#applyChanges()', function() {
        it('should apply changes from paths layer correctly', function() {
            var project = new Wick.Project();
            var frame = project.activeFrame;

            frame.addPath(new Wick.Path(new paper.Path({fillColor:'#ffffff'}).exportJSON({asString:true})));
            frame.addPath(new Wick.Path(new paper.Path({fillColor:'#ffffff'}).exportJSON({asString:true})));
            frame.addPath(new Wick.Path(new paper.Path({fillColor:'#ffffff'}).exportJSON({asString:true})));

            frame.view.render(frame);

            frame.view.pathsLayer.children[0].fillColor = '#aabbcc';
            frame.view.pathsLayer.children[1].fillColor = '#ddeeff';
            frame.view.pathsLayer.children[2].fillColor = '#112233';
            frame.view.pathsLayer.addChild(new paper.Path({fillColor:'#abcdef'}));
            frame.view.applyChanges();
            expect(frame.paths[0].paperPath.fillColor.toCSS(true)).to.equal('#aabbcc');
            expect(frame.paths[1].paperPath.fillColor.toCSS(true)).to.equal('#ddeeff');
            expect(frame.paths[2].paperPath.fillColor.toCSS(true)).to.equal('#112233');
            expect(frame.paths[3].paperPath.fillColor.toCSS(true)).to.equal('#abcdef');
        });

        it('should reorder clips from clips layer correctly', function() {
            var project = new Wick.Project();
            var frame = project.activeFrame;

            var clipA = new Wick.Clip();
            var clipB = new Wick.Clip();
            var clipC = new Wick.Clip();

            frame.addClip(clipA);
            frame.addClip(clipB);
            frame.addClip(clipC);

            frame.view.render(frame);
            frame.view.clipsLayer.children[0].insertAbove(frame.view.clipsLayer.children[2]);

            frame.view.applyChanges();

            expect(frame.clips.indexOf(clipA)).to.equal(2);
            expect(frame.clips.indexOf(clipB)).to.equal(0);
            expect(frame.clips.indexOf(clipC)).to.equal(1);
        });

        it('should delete clips from clips layer correctly', function() {
            var project = new Wick.Project();
            var frame = project.activeFrame;

            var clipA = new Wick.Clip();
            var clipB = new Wick.Clip();
            var clipC = new Wick.Clip();

            frame.addClip(clipA);
            frame.addClip(clipB);
            frame.addClip(clipC);

            frame.view.render(frame);
            frame.view.clipsLayer.children[1].remove();

            frame.view.applyChanges(frame, frame.view.clipsLayer);

            expect(frame.clips.length).to.equal(2);
            expect(frame.clips.indexOf(clipA)).to.equal(0);
            expect(frame.clips.indexOf(clipC)).to.equal(1);
        });

        it('should reposition clips from clips layer correctly', function() {
            var project = new Wick.Project();
            var frame = project.activeFrame;

            var clipA = new Wick.Clip();
            clipA.timeline.addLayer(new Wick.Layer());
            clipA.timeline.layers[0].addFrame(new Wick.Frame());
            clipA.timeline.layers[0].frames[0].svg = '<g xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" fill-rule=\"nonzero\" stroke=\"none\" stroke-width=\"1\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\" stroke-miterlimit=\"10\" stroke-dasharray=\"\" stroke-dashoffset=\"0\" font-family=\"none\" font-weight=\"none\" font-size=\"none\" text-anchor=\"none\" style=\"mix-blend-mode: normal\"><path d=\"M20,0c0,-16.56854 13.43146,-30 30,-30c16.56854,0 30,13.43146 30,30c0,16.56854 -13.43146,30 -30,30c-16.56854,0 -30,-13.43146 -30,-30z\" stroke=\"#ff0000\"/><path d=\"M20,50c0,-16.56854 13.43146,-30 30,-30c16.56854,0 30,13.43146 30,30c0,16.56854 -13.43146,30 -30,30c-16.56854,0 -30,-13.43146 -30,-30z\" stroke=\"#0000ff\"/><path d=\"M-30,50c0,-16.56854 13.43146,-30 30,-30c16.56854,0 30,13.43146 30,30c0,16.56854 -13.43146,30 -30,30c-16.56854,0 -30,-13.43146 -30,-30z\" stroke=\"#ff0000\"/></g>';

            var clipB = new Wick.Clip();
            clipB.timeline.addLayer(new Wick.Layer());
            clipB.timeline.layers[0].addFrame(new Wick.Frame());
            clipB.timeline.layers[0].frames[0].svg = '<g xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" fill-rule=\"nonzero\" stroke=\"none\" stroke-width=\"1\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\" stroke-miterlimit=\"10\" stroke-dasharray=\"\" stroke-dashoffset=\"0\" font-family=\"none\" font-weight=\"none\" font-size=\"none\" text-anchor=\"none\" style=\"mix-blend-mode: normal\"><path d=\"M20,0c0,-16.56854 13.43146,-30 30,-30c16.56854,0 30,13.43146 30,30c0,16.56854 -13.43146,30 -30,30c-16.56854,0 -30,-13.43146 -30,-30z\" stroke=\"#ff0000\"/><path d=\"M20,50c0,-16.56854 13.43146,-30 30,-30c16.56854,0 30,13.43146 30,30c0,16.56854 -13.43146,30 -30,30c-16.56854,0 -30,-13.43146 -30,-30z\" stroke=\"#0000ff\"/><path d=\"M-30,50c0,-16.56854 13.43146,-30 30,-30c16.56854,0 30,13.43146 30,30c0,16.56854 -13.43146,30 -30,30c-16.56854,0 -30,-13.43146 -30,-30z\" stroke=\"#ff0000\"/></g>';

            frame.addClip(clipA);
            frame.addClip(clipB);

            frame.view.render(frame);

            frame.view.clipsLayer.children[0].position.x = 100;
            frame.view.clipsLayer.children[0].position.y = 200;
            frame.view.clipsLayer.children[0].scaling.x = 1.5;
            frame.view.clipsLayer.children[0].scaling.y = 2.5;
            frame.view.clipsLayer.children[0].rotation = 90;
            frame.view.clipsLayer.children[0].opacity = 0.5;
            frame.view.applyChanges(frame, frame.view.clipsLayer);

            expect(frame.clips[0].transformation.x).to.equal(100);
            expect(frame.clips[0].transformation.y).to.equal(200);
            expect(frame.clips[0].transformation.scaleX).to.equal(1.5);
            expect(frame.clips[0].transformation.scaleY).to.equal(2.5);
            expect(frame.clips[0].transformation.rotation).to.equal(90);
            expect(frame.clips[0].transformation.opacity).to.equal(0.5);

            expect(frame.clips[1].transformation.x).to.equal(0);
            expect(frame.clips[1].transformation.y).to.equal(0);
            expect(frame.clips[1].transformation.scaleX).to.equal(1.0);
            expect(frame.clips[1].transformation.scaleY).to.equal(1.0);
            expect(frame.clips[1].transformation.rotation).to.equal(0);
            expect(frame.clips[1].transformation.opacity).to.equal(1.0);
        });

        it('should update raster data', function() {
            var project = new Wick.Project();
            var frame = project.activeFrame;
            var asset = new Wick.ImageAsset('test.png', TEST_IMG_SRC);
            project.addAsset(asset);

            frame.addPath(new Wick.Path(["Raster",{"applyMatrix":false,"crossOrigin":"","source":"asset","asset":asset.uuid}]));
            frame.view.render(frame);

            frame.view.pathsLayer.children[0].position.x += 50;
            frame.view.applyChanges(frame, frame.view.pathsLayer);

            expect(frame.paths[0].paperPath.source).to.equal(TEST_IMG_SRC);
            expect(frame.paths[0].paperPath.position.x).to.equal(50);
        });
    });

    describe('#render (WebGL)', function () {
        it('should call render() with blank frame without errors', function() {
            var project = new Wick.Project();
            project.renderMode = 'webgl';

            var frame = project.activeFrame;
            frame.view.render(frame);

            project.view.destroy();
        });

        it('should create blank pixi.js containers', function(done) {
            var project = new Wick.Project();
            project.view.renderMode = 'webgl';

            var frame = project.activeFrame;
            project.view.prerasterize(() => {
                project.view.render();

                // Project should contain correct items
                expect(project.view._pixiRootContainer.children.length).to.equal(3);
                expect(project.view._pixiRootContainer.children[0]._wickDebugData.type).to.equal('canvas_stage');
                expect(project.view._pixiRootContainer.children[1]._wickDebugData.type).to.equal('frame_pathscontainer');
                expect(project.view._pixiRootContainer.children[1]._wickDebugData.uuid).to.equal(frame.uuid);
                expect(project.view._pixiRootContainer.children[2]._wickDebugData.type).to.equal('frame_clipscontainer');
                expect(project.view._pixiRootContainer.children[2]._wickDebugData.uuid).to.equal(frame.uuid);

                expect(frame.view.pathsContainer.children.length).to.equal(0);

                project.view.destroy();

                done();
            });
        });

        it('should create PIXI.js container with rasterized SVGs from frame SVG', function(done) {
            var project = new Wick.Project();
            project.view.renderMode = 'webgl';

            var circle1 = new paper.Path.Circle({
                center: [0, 0],
                radius: 30,
                strokeColor: 'black',
                fillColor: 'red',
            });
            var circle2 = new paper.Path.Circle({
                center: [10, 10],
                radius: 30,
                strokeColor: 'black',
                fillColor: 'green',
            });
            var circle3 = new paper.Path.Circle({
                center: [20, 20],
                radius: 30,
                strokeColor: 'black',
                fillColor: 'blue',
            });

            var frame = project.activeFrame;
            frame.addPath(new Wick.Path(circle1.exportJSON()));
            frame.addPath(new Wick.Path(circle2.exportJSON()));
            frame.addPath(new Wick.Path(circle3.exportJSON()));
            project.view.prerasterize(() => {
                project.view.render();

                // Project should contain correct items
                expect(project.view._pixiRootContainer.children.length).to.equal(3);
                expect(project.view._pixiRootContainer.children[0]._wickDebugData.type).to.equal('canvas_stage');
                expect(project.view._pixiRootContainer.children[1]._wickDebugData.type).to.equal('frame_pathscontainer');
                expect(project.view._pixiRootContainer.children[1]._wickDebugData.uuid).to.equal(frame.uuid);
                expect(project.view._pixiRootContainer.children[2]._wickDebugData.type).to.equal('frame_clipscontainer');
                expect(project.view._pixiRootContainer.children[2]._wickDebugData.uuid).to.equal(frame.uuid);

                // Frame SVG paths get flattened into a single rasterized image, so we expect only one item
                expect(frame.view.pathsContainer.children.length).to.equal(1);

                var sprite = frame.view.pathsContainer.children[0];
                expect(sprite.texture.width).to.equal(82 * Wick.View.Frame.RASTERIZE_RESOLUTION_MODIFIER);
                expect(sprite.texture.height).to.equal(82 * Wick.View.Frame.RASTERIZE_RESOLUTION_MODIFIER);
                expect(sprite.x).to.equal(-30);
                expect(sprite.y).to.equal(-30);

                project.view.destroy();

                done();
            });
        });

        it('should render updated SVG', function (done) {
            var project = new Wick.Project();
            project.view.renderMode = 'webgl';

            var svgData1 = new paper.Path.Circle({
                center: [0, 0],
                radius: 30,
                strokeColor: 'black',
                fillColor: 'red',
            }).exportJSON();
            var svgData2 = new paper.Path.Circle({
                center: [100, 100],
                radius: 30,
                strokeColor: 'black',
                fillColor: 'red',
            }).exportJSON();

            var frame = project.activeFrame;
            frame.addPath(new Wick.Path(svgData1));

            project.view.prerasterize(() => {
                project.view.render();

                // Project should contain correct items
                expect(project.view._pixiRootContainer.children.length).to.equal(3);
                expect(project.view._pixiRootContainer.children[0]._wickDebugData.type).to.equal('canvas_stage');
                expect(project.view._pixiRootContainer.children[1]._wickDebugData.type).to.equal('frame_pathscontainer');
                expect(project.view._pixiRootContainer.children[1]._wickDebugData.uuid).to.equal(frame.uuid);
                expect(project.view._pixiRootContainer.children[2]._wickDebugData.type).to.equal('frame_clipscontainer');
                expect(project.view._pixiRootContainer.children[2]._wickDebugData.uuid).to.equal(frame.uuid);

                expect(frame.view.pathsContainer.children.length).to.equal(1);

                var sprite = frame.view.pathsContainer.children[0];
                expect(sprite.texture.width).to.equal(62 * Wick.View.Frame.RASTERIZE_RESOLUTION_MODIFIER);
                expect(sprite.texture.height).to.equal(62 * Wick.View.Frame.RASTERIZE_RESOLUTION_MODIFIER);
                expect(sprite.x).to.equal(-30);
                expect(sprite.y).to.equal(-30);

                // Second render: change the paths of the frame
                frame.removeAllPaths();
                frame.addPath(new Wick.Path(svgData2));
                frame.view.clearRasterCache();
                project.view.prerasterize(() => {
                    project.view.render();

                    expect(frame.view.pathsContainer.children.length).to.equal(1);

                    var sprite = frame.view.pathsContainer.children[0];
                    expect(sprite.texture.width).to.equal(62 * Wick.View.Frame.RASTERIZE_RESOLUTION_MODIFIER);
                    expect(sprite.texture.height).to.equal(62 * Wick.View.Frame.RASTERIZE_RESOLUTION_MODIFIER);
                    expect(sprite.x).to.equal(100-30);
                    expect(sprite.y).to.equal(100-30);

                    done();
                });
            });
        });

        it('should position multiple rastered frame SVGs correctly on different layers', function (done) {
            var project = new Wick.Project();
            project.view.renderMode = 'webgl';

            var svgData1 = new paper.Path.Circle({
                center: [0, 0],
                radius: 30,
                strokeColor: 'black',
                fillColor: 'red',
            }).exportJSON();
            var svgData2 = new paper.Path.Circle({
                center: [100, 100],
                radius: 30,
                strokeColor: 'black',
                fillColor: 'blue',
            }).exportJSON();

            var frame1 = project.activeFrame;
            frame1.addPath(new Wick.Path(svgData1));

            var frame2 = new Wick.Frame();
            frame2.addPath(new Wick.Path(svgData2));

            project.root.timeline.addLayer(new Wick.Layer());
            project.root.timeline.layers[1].addFrame(frame2);

            project.view.prerasterize(() => {
                project.view.render();

                // Project should contain correct items
                expect(project.view._pixiRootContainer.children.length).to.equal(5);
                expect(project.view._pixiRootContainer.children[0]._wickDebugData.type).to.equal('canvas_stage');
                expect(project.view._pixiRootContainer.children[1]._wickDebugData.type).to.equal('frame_pathscontainer');
                expect(project.view._pixiRootContainer.children[1]._wickDebugData.uuid).to.equal(frame2.uuid);
                expect(project.view._pixiRootContainer.children[2]._wickDebugData.type).to.equal('frame_clipscontainer');
                expect(project.view._pixiRootContainer.children[2]._wickDebugData.uuid).to.equal(frame2.uuid);
                expect(project.view._pixiRootContainer.children[3]._wickDebugData.type).to.equal('frame_pathscontainer');
                expect(project.view._pixiRootContainer.children[3]._wickDebugData.uuid).to.equal(frame1.uuid);
                expect(project.view._pixiRootContainer.children[4]._wickDebugData.type).to.equal('frame_clipscontainer');
                expect(project.view._pixiRootContainer.children[4]._wickDebugData.uuid).to.equal(frame1.uuid);

                var sprite1 = frame1.view.pathsContainer.children[0];
                expect(sprite1.texture.width).to.equal(62 * Wick.View.Frame.RASTERIZE_RESOLUTION_MODIFIER);
                expect(sprite1.texture.height).to.equal(62 * Wick.View.Frame.RASTERIZE_RESOLUTION_MODIFIER);
                expect(sprite1.x).to.equal(-30);
                expect(sprite1.y).to.equal(-30);

                var sprite2 = frame2.view.pathsContainer.children[0];
                expect(sprite2.texture.width).to.equal(62 * Wick.View.Frame.RASTERIZE_RESOLUTION_MODIFIER);
                expect(sprite2.texture.height).to.equal(62 * Wick.View.Frame.RASTERIZE_RESOLUTION_MODIFIER);
                expect(sprite2.x).to.equal(100-30);
                expect(sprite2.y).to.equal(100-30);

                project.view.destroy();
                done();
            });
        });

        it('should not render onion skinned frames', function (done) {
            var project = new Wick.Project();
            project.onionSkinEnabled = true;

            // Render some onion skinned objects before going into SVG mode to make sure they dont show up later
            project.view.renderMode = 'svg';
            project.view.render();

            project.view.renderMode = 'webgl';

            var svgData1 = new paper.Path.Circle({
                center: [0, 0],
                radius: 30,
                strokeColor: 'black',
                fillColor: 'red',
            }).exportJSON();
            var frame2 = new Wick.Frame();
            frame2.addPath(new Wick.Path(svgData2));

            var svgData2 = new paper.Path.Circle({
                center: [100, 100],
                radius: 30,
                strokeColor: 'black',
                fillColor: 'blue',
            }).exportJSON();
            var frame1 = project.activeFrame;
            frame1.addPath(new Wick.Path(svgData1));

            project.root.timeline.activeLayer.addFrame(frame2);

            project.view.prerasterize(() => {
                project.view.render();

                // Project should contain correct items
                expect(project.view._pixiRootContainer.children.length).to.equal(3);
                expect(project.view._pixiRootContainer.children[0]._wickDebugData.type).to.equal('canvas_stage');
                expect(project.view._pixiRootContainer.children[1]._wickDebugData.type).to.equal('frame_pathscontainer');
                expect(project.view._pixiRootContainer.children[1]._wickDebugData.uuid).to.equal(frame1.uuid);
                expect(project.view._pixiRootContainer.children[2]._wickDebugData.type).to.equal('frame_clipscontainer');
                expect(project.view._pixiRootContainer.children[2]._wickDebugData.uuid).to.equal(frame1.uuid);

                project.view.destroy();
                done();
            });
        });
    });
});
