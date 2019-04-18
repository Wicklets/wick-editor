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

    describe('#clone', function() {
        it('should clone correctly', function() {
            var baseOrig = new Wick.Base();
            var baseClone = baseOrig.clone(true);
            expect(baseOrig !== baseClone).to.equal(true);
            expect(baseClone instanceof Wick.Base).to.equal(true);
            expect(baseClone.uuid !== undefined).to.equal(true);
            expect(baseClone.uuid === baseOrig.uuid).to.equal(true);
        });

        it('should clone correctly (retainUUIDs=false)', function() {
            var baseOrig = new Wick.Base();
            var baseClone = baseOrig.clone(false);
            expect(baseOrig).not.to.equal(baseClone);
            expect(baseClone instanceof Wick.Base).to.equal(true);
            expect(baseClone.uuid).not.to.equal(undefined);
            expect(baseClone.uuid).not.to.equal(baseOrig.uuid);
        });
    });

    describe('#serialize', function() {
        it('should serialize correctly', function() {
            var base = new Wick.Base();
            var data = base.serialize();
            expect(data.classname).to.equal('Base');
            expect(data.uuid).to.equal(base.uuid);
        });

        it('should serialize subclasses and recover child attributes correctly', function() {
            var origButton = new Wick.Button();
            origButton.identifier = 'dummyname';

            var data = origButton.serialize();

            expect(data.classname).to.equal('Button');
            expect(data.identifier).to.equal('dummyname');
        });
    });

    describe('#deserialize', function() {
        it('should deserialize correctly', function() {
            var data = {uuid:'dummy', classname:'Base'};
            var base = Wick.Base.deserialize(data);
            expect(base instanceof Wick.Base).to.equal(true);
            expect(base.uuid).to.equal('dummy');
        });

        it('should deserialize subclasses and recover child attributes correctly', function() {
            var data = {
                classname: 'Button',
                identifier: 'dummyname',
                scripts: [],
                timeline: new Wick.Timeline().serialize(),
                transform: new Wick.Transformation().serialize(),
            };

            var button = Wick.Base.deserialize(data); // Notice how we use Wick.Base.deserialize() here
            expect(button.identifier).to.equal('dummyname');
        });
    });

    describe('#identifier', function () {
        it('should only accept valid variable names', function() {
            var tickable = new Wick.Tickable();

            // Valid names
            tickable.identifier = 'dummy';
            expect(tickable.identifier).to.equal('dummy');
            tickable.identifier = 'foo';
            expect(tickable.identifier).to.equal('foo');
            tickable.identifier = 'bar';
            expect(tickable.identifier).to.equal('bar');
            tickable.identifier = 'bar123';
            expect(tickable.identifier).to.equal('bar123');
            tickable.identifier = 'foo_bar';
            expect(tickable.identifier).to.equal('foo_bar');

            tickable.identifier = 'dummy';

            // Invalid names
            tickable.identifier = 'f o o';
            expect(tickable.identifier).to.equal('dummy');
            tickable.identifier = ' foo';
            expect(tickable.identifier).to.equal('dummy');
            tickable.identifier = 'foo-bar';
            expect(tickable.identifier).to.equal('dummy');
            tickable.identifier = '123foo';
            expect(tickable.identifier).to.equal('dummy');
        });

        it('should only accept non-duplicate names', function() {
            var frame = new Wick.Frame();
            var obj1 = new Wick.Path();
            var obj2 = new Wick.Path();
            var obj3 = new Wick.Clip();
            var obj4 = new Wick.Clip();

            frame.addPath(obj1);
            frame.addPath(obj2);
            frame.addClip(obj3);

            obj1.identifier = 'foo';
            obj2.identifier = 'bar';
            obj3.identifier = 'foo';

            expect(obj1.identifier).to.equal('foo');
            expect(obj2.identifier).to.equal('bar');
            expect(obj3.identifier).to.equal('foo copy');
            expect(obj4.identifier).to.equal(null);
        });
    });

    describe('#parent', function() {
        it('should create parent references', function() {
            var base = new Wick.Base();
            var dummyChild = {};
            base._addChild(dummyChild);

            expect(base._children.length).to.equal(1);
            expect(base._children[0]).to.equal(dummyChild);
            expect(dummyChild.parent).to.equal(base);
        });

        it('should create recursive parent references', function() {
            var child = new Wick.Base();
            var parent = new Wick.Base();
            var grandparent = new Wick.Base();
            parent._addChild(child);
            grandparent._addChild(parent);
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
            parentBase._addChild(base);
            expect(base.parentTimeline).to.equal(null);

            var parentTimeline = new Wick.Timeline();
            parentTimeline._addChild(parentBase);
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
            parentBase._addChild(base);
            expect(base.parentFrame).to.equal(null);

            var parentFrame = new Wick.Frame();
            parentFrame._addChild(parentBase);
            expect(parentBase.parentFrame).to.equal(parentFrame);
            expect(base.parentFrame).to.equal(parentFrame);
        });
    });

    describe('#project', function() {
        it('should create project references', function() {
            var project = new Wick.Project();

            var base = new Wick.Base();
            var child = {};
            base._addChild(child);

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
            var uuidTestChild4 = new Wick.Base();
            var uuidTestChild5 = new Wick.Base();
            uuidTestParent._addChild(uuidTestChild1);
            uuidTestParent._addChild(uuidTestChild2);
            uuidTestParent._addChild(uuidTestChild3);
            uuidTestChild3._addChild(uuidTestChild4);
            uuidTestChild3._addChild(uuidTestChild5);
            expect(uuidTestParent.getChildByUUID(uuidTestChild1.uuid)).to.equal(uuidTestChild1);
            expect(uuidTestParent.getChildByUUID(uuidTestChild2.uuid)).to.equal(uuidTestChild2);
            expect(uuidTestParent.getChildByUUID(uuidTestChild3.uuid)).to.equal(uuidTestChild3);
            expect(uuidTestParent.getChildByUUID(uuidTestChild4.uuid)).to.equal(uuidTestChild4);
            expect(uuidTestParent.getChildByUUID(uuidTestChild5.uuid)).to.equal(uuidTestChild5);
        });
    });
});
