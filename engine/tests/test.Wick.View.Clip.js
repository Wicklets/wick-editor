describe('Wick.View.Clip', function() {
    describe('#render (SVG)', function () {
        it('should call render() with blank clip without errors', function() {
            var project = new Wick.Project();
            project.view.renderMode = 'svg';

            var clip = new Wick.Clip();
            project.activeFrame.addClip(clip);

            clip.view.render(clip);
        });

        it('should create empty paper.js group from empty wick clip', function() {
            var project = new Wick.Project();
            project.view.renderMode = 'svg';

            var clip = new Wick.Clip();
            project.activeFrame.addClip(clip);
            clip.timeline = new Wick.Timeline();
            clip.view.render(clip);

            expect(clip.view.group instanceof paper.Group).to.equal(true);
            expect(clip.view.group.data.wickUUID).to.equal(clip.uuid);
            expect(clip.view.group.data.wickType).to.equal('clip');
            expect(clip.view.group.children.length).to.equal(0);
        });

        it('should create paper group from populated wick clip', function() {
            var project = new Wick.Project();
            project.view.renderMode = 'svg';

            var dummyPathJson = new paper.Path().exportJSON({asString:false});

            var clip = new Wick.Clip();
            project.activeFrame.addClip(clip);
            clip.timeline.addLayer(new Wick.Layer());
            clip.timeline.layers[0].addFrame(new Wick.Frame());
            clip.timeline.layers[0].frames[0].addPath(new Wick.Path({json: dummyPathJson}));
            clip.timeline.layers[0].frames[0].addPath(new Wick.Path({json: dummyPathJson}));
            clip.timeline.layers[0].frames[0].addPath(new Wick.Path({json: dummyPathJson}));

            clip.view.render(clip);

            expect(clip.view.group.children.length).to.equal(2);

            expect(clip.view.group.children[0].data.wickUUID).to.equal(clip.activeFrame.uuid);
            expect(clip.view.group.children[0].data.wickType).to.equal('paths');
            expect(clip.view.group.children[0].children.length).to.equal(3);

            expect(clip.view.group.children[1].data.wickUUID).to.equal(clip.activeFrame.uuid);
            expect(clip.view.group.children[1].data.wickType).to.equal('clips');
        });

        it('should create paper group from populated wick clip with scripts', function() {
            var project = new Wick.Project();
            project.view.renderMode = 'svg';

            var dummyPathJson = new paper.Path().exportJSON({asString:false});

            var clip = new Wick.Clip();
            clip.addScript('update', '// There is content in this script!');
            project.activeFrame.addClip(clip);
            clip.timeline.addLayer(new Wick.Layer());
            clip.timeline.layers[0].addFrame(new Wick.Frame());
            clip.timeline.layers[0].frames[0].addPath(new Wick.Path({json: dummyPathJson}));
            clip.timeline.layers[0].frames[0].addPath(new Wick.Path({json: dummyPathJson}));
            clip.timeline.layers[0].frames[0].addPath(new Wick.Path({json: dummyPathJson}));

            clip.view.render(clip);

            expect(clip.view.group.children.length).to.equal(3);

            expect(clip.view.group.children[0].data.wickUUID).to.equal(clip.activeFrame.uuid);
            expect(clip.view.group.children[0].data.wickType).to.equal('paths');
            expect(clip.view.group.children[0].children.length).to.equal(3);

            expect(clip.view.group.children[1].data.wickUUID).to.equal(clip.activeFrame.uuid);
            expect(clip.view.group.children[1].data.wickType).to.equal('clips');

            expect(clip.view.group.children[2].data.wickType).to.equal('clip_border');
        });

        it('should create paper group with correct transformation', function() {
            var project = new Wick.Project();
            project.view.renderMode = 'svg';

            var clip = new Wick.Clip();
            project.activeFrame.addClip(clip);
            clip.timeline.addLayer(new Wick.Layer());
            clip.timeline.layers[0].addFrame(new Wick.Frame());

            var pathJson1 = new paper.Path({
                segments: [[-50,0], [-50,100], [100,100], [100,0]],
                fillColor: 'black',
            }).exportJSON({asString:false});
            var pathJson2 = new paper.Path({
                segments: [[0,0], [0,200], [200,200], [200,0]],
                fillColor: 'black',
            }).exportJSON({asString:false});
            var pathJson3 = new paper.Path({
                segments: [[0,0], [0,300], [100,300], [100,0]],
                fillColor: 'black',
            }).exportJSON({asString:false});

            // The bounds for this clip should end up being (-50,0) - (200,300)
            clip.timeline.layers[0].frames[0].addPath(new Wick.Path({json:pathJson1}));
            clip.timeline.layers[0].frames[0].addPath(new Wick.Path({json:pathJson2}));
            clip.timeline.layers[0].frames[0].addPath(new Wick.Path({json:pathJson3}));

            clip.view.render();
            expect(clip.view.group.children[0].children.length).to.equal(3);
            expect(clip.view.group.children[0].bounds.x).to.equal(-50);
            expect(clip.view.group.children[0].bounds.y).to.equal(0)
            expect(clip.view.group.children[0].bounds.width).to.equal(50 + 200)
            expect(clip.view.group.children[0].bounds.height).to.equal(300)
        });
    });

    describe('#render (WebGL)', function () {

    });
});
