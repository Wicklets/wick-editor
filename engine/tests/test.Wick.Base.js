describe('Wick.Base', function() {
    describe('#constructor', function() {
        it('should instantiate correctly', function() {
            var base = new Wick.Base();
            expect(base instanceof Wick.Base).to.equal(true);
            expect(base.classname).to.equal('Base');

            expect(typeof base.uuid).to.equal('string');
            expect(base.parent).to.equal(null);
            expect(base.project).to.equal(null);
        });
    });

    describe('#serialize', function () {
        it('should serialize correctly', function () {
            var child1 = new Wick.Base();
            var child2 = new Wick.Base();
            var child3 = new Wick.Base();

            var base = new Wick.Base({
                identifier: 'foo',
            });
            base.addChild(child1);
            base.addChild(child2);
            base.addChild(child3);
            var data = base.serialize();

            expect(data.children).to.eql([
                child1.uuid,
                child2.uuid,
                child3.uuid,
            ]);
            expect(data.classname).to.equal('Base');
            expect(data.identifier).to.equal('foo');
            expect(data.uuid).to.equal(base.uuid);
        });
    });

    describe('#deserialize', function () {
        it('should deserialize correctly', function () {
            Wick.ObjectCache.removeAllObjects();

            var child1 = new Wick.Base();
            var child2 = new Wick.Base();
            var child3 = new Wick.Base();

            var base = new Wick.Base({
                identifier: 'foo',
            });
            base.addChild(child1);
            base.addChild(child2);
            base.addChild(child3);
            var data = base.serialize();
            var base = Wick.Base.fromData(data);

            expect(base instanceof Wick.Base).to.equal(true);
            expect(base.children).to.eql([
                child1,
                child2,
                child3,
            ]);
            expect(base.identifier).to.equal('foo');
            expect(base.uuid).to.equal(data.uuid);
        });
    });

    describe('#clone', function () {
        it('should clone correctly', function () {

        });
    })

    describe('#identifier', function () {
        it('should only accept valid variable names', function() {
            var base = new Wick.Base();

            // Valid names
            base.identifier = 'dummy';
            expect(base.identifier).to.equal('dummy');
            base.identifier = 'foo';
            expect(base.identifier).to.equal('foo');
            base.identifier = 'bar';
            expect(base.identifier).to.equal('bar');
            base.identifier = 'bar123';
            expect(base.identifier).to.equal('bar123');
            base.identifier = 'foo_bar';
            expect(base.identifier).to.equal('foo_bar');

            base.identifier = 'dummy';

            // Invalid names
            base.identifier = 'f o o';
            expect(base.identifier).to.equal('dummy');
            base.identifier = ' foo';
            expect(base.identifier).to.equal('dummy');
            base.identifier = 'foo-bar';
            expect(base.identifier).to.equal('dummy');
            base.identifier = '123foo';
            expect(base.identifier).to.equal('dummy');
        });

        it('should rename duplicate identifiers', function() {
            var parent = new Wick.Base();
            var child1 = new Wick.Base();
            var child2 = new Wick.Base();
            var child3 = new Wick.Base();
            var child4 = new Wick.Base();
            var child5 = new Wick.Base();

            var project = new Wick.Project();
            project.addObject(parent);

            child1.identifier = 'foo';
            child2.identifier = 'bar';
            child3.identifier = 'foo';
            child4.identifier = 'foo';

            parent.addChild(child1);
            parent.addChild(child2);
            parent.addChild(child3);
            parent.addChild(child4);
            parent.addChild(child5);

            expect(child1.identifier).to.equal('foo');
            expect(child2.identifier).to.equal('bar');
            expect(child3.identifier).to.equal('foo_copy');
            expect(child4.identifier).to.equal('foo_copy_copy');
            expect(child5.identifier).to.equal(null);
        });
    });

    describe('#children', function() {
        it('should add and remove children', function () {
            var parent = new Wick.Base();
            var child1 = new Wick.Base();
            var child2 = new Wick.Base();
            var child3 = new Wick.Base();

            parent.addChild(child1);
            parent.addChild(child2);
            parent.addChild(child3);
            expect(parent.children[0]).to.equal(child1)
            expect(parent.children[1]).to.equal(child2)
            expect(parent.children[2]).to.equal(child3)

            parent.removeChild(child2);
            expect(parent.children[0]).to.equal(child1)
            expect(parent.children[1]).to.equal(child3)
        });
    });

    describe('#parent', function() {
        it('should create parent references', function() {
            var base = new Wick.Base();
            var dummyChild = new Wick.Base();
            base.addChild(dummyChild);

            expect(base.children.length).to.equal(1);
            expect(base.children[0]).to.equal(dummyChild);
            expect(dummyChild.parent).to.equal(base);
        });

        it('should create recursive parent references', function() {
            var child = new Wick.Base();
            var parent = new Wick.Base();
            var grandparent = new Wick.Base();
            parent.addChild(child);
            grandparent.addChild(parent);
            expect(child.parent).to.equal(parent);
            expect(parent.parent).to.equal(grandparent);
            expect(child.parent.parent).to.equal(grandparent);
        });
    });

    describe('#parentClip', function() {
        it('should get parent clip correctly', function() {
            var subclip = new Wick.Clip();
            var frame = new Wick.Frame();
            var layer = new Wick.Layer();
            var timeline = new Wick.Timeline();
            var clip = new Wick.Clip();

            expect(subclip.parentClip).to.equal(null);

            frame.addClip(subclip);
            layer.addFrame(frame);
            timeline.addLayer(layer);
            clip.timeline = timeline;

            expect(subclip.parentClip).to.equal(clip);
        });
    });

    describe('#parentTimeline', function() {
        it('should get parent timeline correctly', function() {
            var base = new Wick.Base();
            expect(base.parentTimeline).to.equal(null);

            var parentBase = new Wick.Base();
            parentBase.addChild(base);
            expect(base.parentTimeline).to.equal(null);

            var parentTimeline = new Wick.Timeline();
            parentTimeline.addChild(parentBase);
            expect(parentBase.parentTimeline).to.equal(parentTimeline);
            expect(base.parentTimeline).to.equal(parentTimeline);
        });
    });

    describe('#parentLayer', function() {
        it('should get parent layer correctly', function() {
            var clip = new Wick.Clip();
            var frame = new Wick.Frame();
            var layer = new Wick.Layer();

            expect(clip.parentLayer).to.equal(null);

            frame.addClip(clip);
            layer.addFrame(frame);

            expect(clip.parentLayer).to.equal(layer);
        });
    });

    describe('#parentFrame', function() {
        it('should get parent frame correctly', function() {
            var base = new Wick.Base();
            expect(base.parentFrame).to.equal(null);

            var parentBase = new Wick.Base();
            parentBase.addChild(base);
            expect(base.parentFrame).to.equal(null);

            var parentFrame = new Wick.Frame();
            parentFrame.addChild(parentBase);
            expect(parentBase.parentFrame).to.equal(parentFrame);
            expect(base.parentFrame).to.equal(parentFrame);
        });
    });

    describe('#project', function() {
        it('should create project references', function() {
            var project = new Wick.Project();

            var base = new Wick.Base();
            var child = new Wick.Base();
            base.addChild(child);

            base.project = project;

            expect(base.project).to.equal(project);
            expect(child.project).to.equal(project);
        });
    });

    describe('#getChildByUUID', function() {
        it('should handle getChildByUUID', function() {
            var uuidTestParent = new Wick.Base();
            var uuidTestChild1 = new Wick.Base();
            var uuidTestChild2 = new Wick.Base();
            var uuidTestChild3 = new Wick.Base();
            uuidTestParent.addChild(uuidTestChild1);
            uuidTestParent.addChild(uuidTestChild2);
            uuidTestParent.addChild(uuidTestChild3);
            expect(uuidTestParent.getChildByUUID(uuidTestChild1.uuid)).to.equal(uuidTestChild1);
            expect(uuidTestParent.getChildByUUID(uuidTestChild2.uuid)).to.equal(uuidTestChild2);
            expect(uuidTestParent.getChildByUUID(uuidTestChild3.uuid)).to.equal(uuidTestChild3);
        });
    });
});
