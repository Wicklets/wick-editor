describe('Wick.View.Frame', function() {
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

            var pathJson1 = new paper.Path({strokeColor:'#ff0000'}).exportJSON({asString:false});
            var pathJson2 = new paper.Path({strokeColor:'#0000ff'}).exportJSON({asString:false});
            var pathJson3 = new paper.Path({strokeColor:'#00ff00'}).exportJSON({asString:false});

            var frame = project.activeFrame;
            frame.addPath(new Wick.Path({json: pathJson1}));
            frame.addPath(new Wick.Path({json: pathJson2}));
            frame.addPath(new Wick.Path({json: pathJson3}));

            frame.view.render(frame);

            expect(frame.view.pathsLayer.children.length).to.equal(3);
            expect(frame.view.pathsLayer.children[0].strokeColor.toCSS(true)).to.equal('#ff0000');
            expect(frame.view.pathsLayer.children[1].strokeColor.toCSS(true)).to.equal('#0000ff');
            expect(frame.view.pathsLayer.children[2].strokeColor.toCSS(true)).to.equal('#00ff00');
        });

        it('should create paper.js layer with layers for groups from frame', function() {
            var project = new Wick.Project();
            var frame = project.activeFrame;

            var path1 = new Wick.Path({
                json: new paper.Path({strokeColor:'#ff0000'}).exportJSON({asString:false})
            })
            var path2 = new Wick.Path({
                json: new paper.Path({strokeColor:'#ff0000'}).exportJSON({asString:false})
            })
            var path3 = new Wick.Path({
                json: new paper.Path({strokeColor:'#ff0000'}).exportJSON({asString:false})
            })

            var clip1 = new Wick.Clip();
            clip1.timeline.addLayer(new Wick.Layer());
            clip1.timeline.layers[0].addFrame(new Wick.Frame());
            clip1.timeline.layers[0].frames[0].addPath(path1);

            var clip2 = new Wick.Clip();
            clip2.timeline.addLayer(new Wick.Layer());
            clip2.timeline.layers[0].addFrame(new Wick.Frame());
            clip2.timeline.layers[0].frames[0].addPath(path2);

            var clip3 = new Wick.Clip();
            clip3.timeline.addLayer(new Wick.Layer());
            clip3.timeline.layers[0].addFrame(new Wick.Frame());
            clip3.timeline.layers[0].frames[0].addPath(path3);

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

            var pathJson1 = new paper.Path({
                segments: [[0,0], [0,100], [100,100], [100,0]],
                fillColor: 'black',
            }).exportJSON({asString:false});
            var pathJson2 = new paper.Path({
                segments: [[0,0], [0,100], [100,100], [100,0]],
                fillColor: 'black',
            }).exportJSON({asString:false});
            var pathJson3 = new paper.Path({
                segments: [[0,0], [0,100], [100,100], [100,0]],
                fillColor: 'black',
            }).exportJSON({asString:false})

            var clip = new Wick.Clip();
            clip.timeline.addLayer(new Wick.Layer());
            clip.timeline.layers[0].addFrame(new Wick.Frame());
            clip.timeline.layers[0].frames[0].addPath(new Wick.Path({json: pathJson1}));
            clip.transformation.x = 100;
            frame.addClip(clip);

            var button = new Wick.Button();
            button.timeline.addLayer(new Wick.Layer());
            button.timeline.layers[0].addFrame(new Wick.Frame());
            button.timeline.layers[0].frames[0].addPath(new Wick.Path({json: pathJson2}));
            button.transformation.x = 200;
            frame.addClip(button);

            frame.addPath(new Wick.Path({json: pathJson3}));

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
            var asset = new Wick.ImageAsset({
                filename: 'test.png',
                src: TestUtils.TEST_IMG_SRC_PNG,
            });
            project.addAsset(asset);

            asset.createInstance(path => {
                frame.addPath(path);

                project.view.render();
                expect(frame.view.pathsLayer.children[0].bounds.width).to.equal(100);
                expect(frame.view.pathsLayer.children[0].bounds.height).to.equal(100);
                expect(frame.view.pathsLayer.children[0].source).to.equal(TestUtils.TEST_IMG_SRC_PNG);
                expect(frame.view.pathsLayer.children[0].position.x).to.equal(0);
                expect(frame.view.pathsLayer.children[0].position.y).to.equal(0);
                done();
            });
        });
    });

    describe('#applyChanges()', function() {
        it('should apply changes from paths layer correctly', function() {
            var project = new Wick.Project();
            var frame = project.activeFrame;

            var path1 = TestUtils.paperToWickPath(new paper.Path({fillColor:'#ffffff'}));
            var path2 = TestUtils.paperToWickPath(new paper.Path({fillColor:'#ffffff'}));
            var path3 = TestUtils.paperToWickPath(new paper.Path({fillColor:'#ffffff'}));

            frame.addPath(path1);
            frame.addPath(path2);
            frame.addPath(path3);

            frame.view.render(frame);

            frame.view.pathsLayer.children[0].fillColor = '#aabbcc';
            frame.view.pathsLayer.children[1].fillColor = '#ddeeff';
            frame.view.pathsLayer.children[2].fillColor = '#112233';
            frame.view.pathsLayer.addChild(new paper.Path({fillColor:'#abcdef'}));
            frame.view.applyChanges();
            expect(frame.paths[0].view.item.fillColor.toCSS(true)).to.equal('#aabbcc');
            expect(frame.paths[1].view.item.fillColor.toCSS(true)).to.equal('#ddeeff');
            expect(frame.paths[2].view.item.fillColor.toCSS(true)).to.equal('#112233');
            expect(frame.paths[3].view.item.fillColor.toCSS(true)).to.equal('#abcdef');
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

            var clipB = new Wick.Clip();
            clipB.timeline.addLayer(new Wick.Layer());
            clipB.timeline.layers[0].addFrame(new Wick.Frame());

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

        it('should update raster data', function(done) {
            var project = new Wick.Project();
            var frame = project.activeFrame;
            var asset = new Wick.ImageAsset({
                filename: 'test.png',
                src: TestUtils.TEST_IMG_SRC_PNG,
            });
            project.addAsset(asset);

            asset.createInstance(path => {
                frame.addPath(path);
                frame.view.render(frame);

                frame.view.pathsLayer.children[0].position.x += 50;
                frame.view.applyChanges(frame, frame.view.pathsLayer);

                expect(frame.paths[0].view.item.source).to.equal(TestUtils.TEST_IMG_SRC_PNG);
                expect(frame.paths[0].view.item.position.x).to.equal(50);
                done();
            });
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
            frame.addPath(TestUtils.paperToWickPath(circle1));
            frame.addPath(TestUtils.paperToWickPath(circle2));
            frame.addPath(TestUtils.paperToWickPath(circle3));
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
            }).exportJSON({asString:true});
            var svgData2 = new paper.Path.Circle({
                center: [100, 100],
                radius: 30,
                strokeColor: 'black',
                fillColor: 'red',
            }).exportJSON({asString:true});

            var frame = project.activeFrame;
            frame.addPath(new Wick.Path({json:svgData1}));

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
                frame.paths.forEach(path => {
                    path.remove();
                });
                frame.addPath(new Wick.Path({json:svgData2}));
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

            var path1 = TestUtils.paperToWickPath(new paper.Path.Circle({
                center: [0, 0],
                radius: 30,
                strokeColor: 'black',
                fillColor: 'red',
            }));
            var path2 = TestUtils.paperToWickPath(new paper.Path.Circle({
                center: [100, 100],
                radius: 30,
                strokeColor: 'black',
                fillColor: 'blue',
            }));

            var frame1 = project.activeFrame;
            frame1.addPath(path1);

            var frame2 = new Wick.Frame();
            frame2.addPath(path2);

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

            var path1 = TestUtils.paperToWickPath(new paper.Path.Circle({
                center: [0, 0],
                radius: 30,
                strokeColor: 'black',
                fillColor: 'red',
            }));

            var frame2 = new Wick.Frame();
            frame2.addPath(path1);

            var path2 = TestUtils.paperToWickPath(new paper.Path.Circle({
                center: [100, 100],
                radius: 30,
                strokeColor: 'black',
                fillColor: 'blue',
            }))
            var frame1 = project.activeFrame;
            frame1.addPath(path2);

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
