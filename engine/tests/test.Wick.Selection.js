describe('Wick.Selection', function() {
    it('should select/deselect objects', function () {
        var project = new Wick.Project();

        var path1 = new Wick.Path({json:TestUtils.TEST_PATH_JSON_RED_SQUARE});
        project.activeFrame.addPath(path1);
        var path2 = new Wick.Path({json:TestUtils.TEST_PATH_JSON_RED_SQUARE});
        project.activeFrame.addPath(path2);
        var path3 = new Wick.Path({json:TestUtils.TEST_PATH_JSON_RED_SQUARE});
        project.activeFrame.addPath(path3);

        var clip1 = new Wick.Clip();
        project.activeFrame.addClip(clip1);
        var clip2 = new Wick.Clip();
        project.activeFrame.addClip(clip2);

        var button1 = new Wick.Button();
        project.activeFrame.addClip(button1);
        var button2 = new Wick.Button();
        project.activeFrame.addClip(button2);

        var frame1 = project.activeFrame;
        frame1.end = 3;
        var frame2 = new Wick.Frame({start:4});
        project.activeLayer.addFrame(frame2);
        var frame3 = new Wick.Frame({start:5});
        project.activeLayer.addFrame(frame3);

        var tween1 = new Wick.Tween({start:1});
        project.activeFrame.addTween(tween1);
        var tween2 = new Wick.Tween({start:2});
        project.activeFrame.addTween(tween2);
        var tween3 = new Wick.Tween({start:3});
        project.activeFrame.addTween(tween3);

        var asset1 = new Wick.ImageAsset({
            filename: 'foo.png',
            src: TestUtils.TEST_IMG_SRC_PNG,
        });
        project.addAsset(asset1);
        var asset2 = new Wick.SoundAsset({

        });
        project.addAsset(asset2);
        var asset3 = new Wick.ClipAsset();
        project.addAsset(asset3);

        var layer1 = project.activeLayer;
        var layer2 = new Wick.Layer();
        project.root.timeline.addLayer(layer2);
        var layer3 = new Wick.Layer();
        project.root.timeline.addLayer(layer3);

        expect(project.selection.getSelectedObjects()).to.eql([]);
        expect(project.selection.numObjects).to.equal(0);

        expect(project.selection.isObjectSelected(path1)).to.equal(false);
        expect(project.selection.isObjectSelected(asset1)).to.equal(false);
        expect(project.selection.isObjectSelected(layer1)).to.equal(false);

        expect(project.selection.types).to.eql([]);
        expect(project.selection.location).to.equal(null);
        expect(project.selection.getSelectedObjects()).to.eql([]);

        project.selection.clear();
        expect(project.selection.getSelectedObjects()).to.eql([]);

        project.selection.select(frame1);
        expect(project.selection.getSelectedObjects()).to.eql([frame1]);
        expect(project.selection.isObjectSelected(frame1)).to.equal(true);
        expect(project.selection.isObjectSelected(frame2)).to.equal(false);

        expect(project.selection.types).to.eql(['Frame']);
        expect(project.selection.location).to.equal('Timeline');
        expect(project.selection.getSelectedObjects()).to.eql([frame1]);

        project.selection.select(layer1);
        expect(project.selection.numObjects).to.equal(2);
        expect(project.selection.getSelectedObjects()).to.eql([frame1, layer1]);
        expect(project.selection.types).to.eql(['Frame', 'Layer']);
        expect(project.selection.location).to.equal('Timeline');

        project.selection.select(layer2);
        expect(project.selection.getSelectedObjects()).to.eql([frame1, layer1, layer2]);
        expect(project.selection.types).to.eql(['Frame', 'Layer']);
        expect(project.selection.location).to.equal('Timeline');

        project.selection.select(asset1);
        expect(project.selection.getSelectedObjects()).to.eql([asset1]);
        expect(project.selection.types).to.eql(['ImageAsset']);
        expect(project.selection.location).to.equal('AssetLibrary');

        project.selection.select(asset2);
        expect(project.selection.getSelectedObjects()).to.eql([asset1, asset2]);
        expect(project.selection.types).to.eql(['ImageAsset', 'SoundAsset']);
        expect(project.selection.location).to.equal('AssetLibrary');

        project.selection.select(path1);
        project.selection.select(path2);
        project.selection.select(path3);
        expect(project.selection.getSelectedObjects()).to.eql([path1, path2, path3]);
        expect(project.selection.numObjects).to.eql(3);
        expect(project.selection.types).to.eql(['Path']);
        expect(project.selection.location).to.equal('Canvas');

        project.selection.select(clip1);
        project.selection.select(button1);
        expect(project.selection.numObjects).to.eql(5);
        expect(project.selection.types).to.eql(['Path', 'Clip', 'Button']);
        expect(project.selection.location).to.equal('Canvas');
        expect(project.selection.getSelectedObjects()).to.eql([path1, path2, path3, clip1, button1]);

        project.selection.clear();
        expect(project.selection.getSelectedObjects()).to.eql([]);
    });

    it('should update transforms of selection (one path)', function () {
        var project = new Wick.Project();

        var json = new paper.Path.Rectangle({
            fillColor: 'red',
            from: new paper.Point(50,50),
            to: new paper.Point(75,75),
        }).exportJSON({asString:false});
        var path = new Wick.Path({json: json});
        project.activeFrame.addPath(path);

        project.selection.select(path);

        expect(path.bounds.left).to.equal(50);
        expect(path.bounds.top).to.equal(50);

        expect(project.selection.x).to.equal(50);
        expect(project.selection.y).to.equal(50);
        expect(project.selection.width).to.equal(25);
        expect(project.selection.height).to.equal(25);
        expect(project.selection.scaleX).to.equal(1);
        expect(project.selection.scaleY).to.equal(1);
        expect(project.selection.rotation).to.equal(0);
        expect(project.selection.fillColor).to.equal('rgb(255,0,0)');
        expect(project.selection.strokeColor).to.equal(null);
        expect(project.selection.strokeWidth).to.equal(1);
        expect(project.selection.opacity).to.equal(1);
        expect(project.selection.center.x).to.be.closeTo(50 + 25/2, 0.01);
        expect(project.selection.center.y).to.be.closeTo(50 + 25/2, 0.01);
        expect(project.selection.identifier).to.equal(null);

        project.selection.x = 150;

        expect(path.bounds.left).to.equal(150);
        expect(path.bounds.top).to.equal(50);

        expect(project.selection.x).to.equal(150);
        expect(project.selection.y).to.equal(50);
        expect(project.selection.width).to.equal(25);
        expect(project.selection.height).to.equal(25);
        expect(project.selection.scaleX).to.equal(1);
        expect(project.selection.scaleY).to.equal(1);
        expect(project.selection.rotation).to.equal(0);
        expect(project.selection.fillColor).to.equal('rgb(255,0,0)');
        expect(project.selection.strokeColor).to.equal(null);
        expect(project.selection.strokeWidth).to.equal(1);
        expect(project.selection.opacity).to.equal(1);
        expect(project.selection.center.x).to.be.closeTo(150 + 25/2, 0.01);
        expect(project.selection.center.y).to.be.closeTo(50 + 25/2, 0.01);
        expect(project.selection.identifier).to.equal(null);
    });

    it('should update transforms of selection (one clip)', function () {
        var project = new Wick.Project();

        var json = new paper.Path.Rectangle({
            fillColor: 'red',
            from: new paper.Point(-50,-50),
            to: new paper.Point(50,50),
        }).exportJSON({asString:false});
        var path = new Wick.Path({json: json});

        var clip = new Wick.Clip({identifier:'foo'});
        clip.activeFrame.addPath(path);
        clip.transformation.x = 50;
        clip.transformation.y = 50;
        project.activeFrame.addClip(clip);

        project.selection.select(clip);

        expect(clip.transformation.x).to.equal(50);
        expect(clip.transformation.y).to.equal(50);

        expect(project.selection.x).to.be.closeTo(0, 0.01);
        expect(project.selection.y).to.be.closeTo(0, 0.01);
        expect(project.selection.width).to.equal(100);
        expect(project.selection.height).to.equal(100);
        expect(project.selection.scaleX).to.equal(1);
        expect(project.selection.scaleY).to.equal(1);
        expect(project.selection.rotation).to.equal(0);
        expect(project.selection.fillColor).to.equal(null);
        expect(project.selection.strokeColor).to.equal(null);
        expect(project.selection.strokeWidth).to.equal(1);
        expect(project.selection.opacity).to.equal(1);
        expect(project.selection.center.x).to.be.closeTo(50, 0.01);
        expect(project.selection.center.y).to.be.closeTo(50, 0.01);
        expect(project.selection.identifier).to.equal('foo');

        project.selection.x = 200;
        project.view.applyChanges();

        expect(clip.transformation.x).to.equal(250);
        expect(clip.transformation.y).to.equal(50);

        expect(project.selection.x).to.equal(200);
        expect(project.selection.y).to.equal(0);
        expect(project.selection.width).to.equal(100);
        expect(project.selection.height).to.equal(100);
        expect(project.selection.scaleX).to.equal(1);
        expect(project.selection.scaleY).to.equal(1);
        expect(project.selection.rotation).to.equal(0);
        expect(project.selection.fillColor).to.equal(null);
        expect(project.selection.strokeColor).to.equal(null);
        expect(project.selection.strokeWidth).to.equal(1);
        expect(project.selection.opacity).to.equal(1);
        expect(project.selection.center.x).to.be.closeTo(250, 0.01);
        expect(project.selection.center.y).to.be.closeTo(50, 0.01);
        expect(project.selection.identifier).to.equal('foo');
    });

    it('should update sound of a selected frame', function () {
        var project = new Wick.Project();

        var sound1 = new Wick.SoundAsset();
        var sound2 = new Wick.SoundAsset();
        var sound3 = new Wick.SoundAsset();
        project.addAsset(sound1);
        project.addAsset(sound2);
        project.addAsset(sound3);

        project.selection.select(project.activeFrame);
        project.selection.sound = sound1;
        expect(project.activeFrame.sound).to.equal(sound1);
    });
});
