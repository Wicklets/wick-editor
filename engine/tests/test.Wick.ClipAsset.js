describe('Wick.ClipAsset', function() {
    describe('#constructor', function () {
        it('should instantiate correctly', function() {
            var asset = new Wick.ClipAsset({
                filename: 'object.wickobj',
                src: TestUtils.TEST_WICKOBJ_SRC,
            });

            expect(asset instanceof Wick.ClipAsset).to.equal(true);
        });
    });

    describe('#createInstance', function () {
        it('should create an instance of the Clip correctly', function(done) {
            var project = new Wick.Project();
            var asset = new Wick.ClipAsset({
                filename: 'object.wickobj',
                src: TestUtils.TEST_WICKOBJ_SRC,
            });
            project.addAsset(asset);

            asset.createInstance(instance => {
                expect(instance instanceof Wick.Clip).to.equal(true);
                done();
            }, project);
        });
    });
/*
    describe('#serialize', function () {
        it('should serialize correctly', function() {
            var clip = new Wick.Clip();
            var asset = new Wick.ClipAsset(clip);

            var data = asset.serialize();

            expect(data.classname).to.equal('ClipAsset');
            expect(data.timeline.classname).to.equal('Timeline');
        });
    });

    describe('#_deserialize', function () {
        it('should deserialize correctly', function() {
            var data = {
                classname: 'ClipAsset',
                timeline: new Wick.Timeline().serialize(),
            };
            var asset = Wick.ClipAsset.deserialize(data);

            expect(asset instanceof Wick.ClipAsset).to.equal(true);
            expect(asset.timeline instanceof Wick.Timeline).to.equal(true);
        });
    });
*/
/*
    describe('#useClipAsSource', function () {
        it('should create asset from existing clips correctly', function() {
            var sourceClip = new Wick.Clip();
            sourceClip.timeline.addLayer(new Wick.Layer());
            sourceClip.timeline.layers[0].name = 'foo';

            var asset = new Wick.ClipAsset(sourceClip);

            expect(asset.timeline instanceof Wick.Timeline).to.equal(true);
            expect(asset.timeline !== sourceClip.timeline).to.equal(true);
            expect(asset.timeline.uuid !== sourceClip.timeline.uuid).to.equal(true);
            expect(asset.timeline.layers.length).to.equal(sourceClip.timeline.layers.length);
            expect(asset.timeline.layers[0].name).to.equal(sourceClip.timeline.layers[0].name);
        });
    });

    describe('#updateClipFromAsset', function () {
        it('should be used as source for clips correctly', function() {
            var sourceClip = new Wick.Clip();
            sourceClip.timeline.addLayer(new Wick.Layer());
            sourceClip.timeline.layers[0].name = 'foo';

            var asset = new Wick.ClipAsset(sourceClip);

            var linkedClip = new Wick.Clip();
            asset.useAsSourceForClip(linkedClip);

            expect(asset.linkedClips.length).to.equal(1);
            expect(asset.linkedClips[0]).to.equal(linkedClip);

            asset.updateClipFromAsset(linkedClip);

            expect(linkedClip.timeline instanceof Wick.Timeline).to.equal(true);
            expect(linkedClip.timeline !== asset.timeline).to.equal(true);
            expect(linkedClip.timeline.layers.length).to.equal(asset.timeline.layers.length);
            expect(linkedClip.timeline.layers[0].name).to.equal(asset.timeline.layers[0].name);
        });
    });

    describe('#createInstance', function () {
        it('create instances of clips correctly', function() {
            var sourceClip = new Wick.Clip();
            sourceClip.timeline.addLayer(new Wick.Layer());
            sourceClip.timeline.layers[0].name = 'foo';

            var asset = new Wick.ClipAsset(sourceClip);

            var instanceClip = asset.createInstance();
            expect(instanceClip instanceof Wick.Clip).to.equal(true);
            expect(instanceClip.timeline instanceof Wick.Timeline).to.equal(true);
            expect(instanceClip.timeline !== asset.timeline).to.equal(true);
            expect(instanceClip.timeline.layers.length).to.equal(asset.timeline.layers.length);
            expect(instanceClip.timeline.layers[0].name).to.equal(asset.timeline.layers[0].name);
        });
    });

    describe('#updateAssetFromClip', function () {
        it('changing one instance should change all other instances', function() {
            var sourceClip = new Wick.Clip();
            sourceClip.timeline.addLayer(new Wick.Layer());
            sourceClip.timeline.layers[0].name = 'foo';

            var asset = new Wick.ClipAsset(sourceClip);

            var instanceClipA = asset.createInstance();
            var instanceClipB = asset.createInstance();
            var unlinkedClip = new Wick.Clip();

            instanceClipA.timeline.layers[0].name = 'bar';
            asset.updateAssetFromClip(instanceClipA);

            expect(instanceClipA !== instanceClipB).to.equal(true);
            expect(instanceClipA.timeline !== instanceClipB.timeline).to.equal(true);
            expect(instanceClipB.timeline.layers[0].name).to.equal('bar');
        });
    });

    describe('#removeAllInstances', function () {
        it('should delete all instances of the asset in the project', function () {
            // TODO
        });
    });
*/
});
