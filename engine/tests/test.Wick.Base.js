describe('Wick.Base', function() {
    it('should instantiate', function () {
        var base = new Wick.Base({
            identifier: 'foo',
        });
        expect(base instanceof Wick.Base).to.equal(true);
        expect(base.classname).to.equal('Base');
        expect(typeof base.uuid).to.equal('string');
        expect(base.identifier).to.equal('foo');
        expect(base.parent).to.equal(null);
        expect(base.project).to.equal(null);
    });

    it('should add/remove children', function() {
        var base = new Wick.Base({
            identifier: 'foo',
        });

        var child1 = new Wick.Base();
        var child2 = new Wick.Base();
        var child3 = new Wick.Base();

        var grandchild1 = new Wick.Base();
        var grandchild2 = new Wick.Base();
        var grandchild3 = new Wick.Base();

        base.addChild(child1);
        base.addChild(child2);
        base.addChild(child3);

        child1.addChild(grandchild1);
        child1.addChild(grandchild2);
        child1.addChild(grandchild3);

        var children = base.getChildren('Base');
        expect(children[0]).to.equal(child1);
        expect(children[1]).to.equal(child2);
        expect(children[2]).to.equal(child3);
        expect(children[0].parent).to.equal(base);
        expect(children[1].parent).to.equal(base);
        expect(children[2].parent).to.equal(base);

        var grandchildren = child1.getChildren('Base');
        expect(grandchildren[0]).to.equal(grandchild1);
        expect(grandchildren[1]).to.equal(grandchild2);
        expect(grandchildren[2]).to.equal(grandchild3);
        expect(grandchildren[0].parent).to.equal(child1);
        expect(grandchildren[1].parent).to.equal(child1);
        expect(grandchildren[2].parent).to.equal(child1);

        base.removeChild(child1);
        base.removeChild(child2);
        base.removeChild(child3);
        expect(base.getChildren('Base').length).to.equal(0);
        expect(child1.parent).to.equal(null);
        expect(child2.parent).to.equal(null);
        expect(child3.parent).to.equal(null);
    });

    it('should create parent references', function() {
        var parent = new Wick.Base();
        var child = new Wick.Base();
        parent.addChild(child);
        expect(child.parent).to.equal(parent);
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

    it('should serialize/deserialize', function () {
        var base = new Wick.Base({
            identifier: 'foo',
        });

        var child1 = new Wick.Base();
        var child2 = new Wick.Base();
        var child3 = new Wick.Base();

        var grandchild1 = new Wick.Base();
        var grandchild2 = new Wick.Base();
        var grandchild3 = new Wick.Base();

        base.addChild(child1);
        base.addChild(child2);
        base.addChild(child3);

        child1.addChild(grandchild1);
        child1.addChild(grandchild2);
        child1.addChild(grandchild3);

        var copy = new Wick.Base();
        var data = base.serialize();
        copy.deserialize(data);

        expect(base.getChildren('Base').length).to.equal(3);
        expect(base.getChildren('Base')[0]).to.equal(child1);
        expect(base.getChildren('Base')[1]).to.equal(child2);
        expect(base.getChildren('Base')[2]).to.equal(child3);

        expect(copy.getChildren('Base').length).to.equal(3);
        expect(copy.getChildren('Base')[0]).to.equal(child1);
        expect(copy.getChildren('Base')[1]).to.equal(child2);
        expect(copy.getChildren('Base')[2]).to.equal(child3);
    });

    it('should copy', function () {
        var base = new Wick.Base({
            identifier: 'foo',
        });

        var child1 = new Wick.Base({identifier: 'child1'});
        var child2 = new Wick.Base({identifier: 'child2'});
        var child3 = new Wick.Base({identifier: 'child3'});

        var grandchild1 = new Wick.Base({identifier: 'grandchild1'});
        var grandchild2 = new Wick.Base({identifier: 'grandchild2'});
        var grandchild3 = new Wick.Base({identifier: 'grandchild3'});

        base.addChild(child1);
        base.addChild(child2);
        base.addChild(child3);

        child1.addChild(grandchild1);
        child1.addChild(grandchild2);
        child1.addChild(grandchild3);

        var copy = base.copy();

        expect(base.getChildren('Base').length).to.equal(3);
        expect(base.getChildren('Base')[0]).to.equal(child1);
        expect(base.getChildren('Base')[1]).to.equal(child2);
        expect(base.getChildren('Base')[2]).to.equal(child3);
        expect(base.getChildren('Base')[0].identifier).to.equal('child1');
        expect(base.getChildren('Base')[1].identifier).to.equal('child2');
        expect(base.getChildren('Base')[2].identifier).to.equal('child3');

        expect(copy.getChildren('Base').length).to.equal(3);
        expect(copy.getChildren('Base')[0]).not.to.equal(child1);
        expect(copy.getChildren('Base')[1]).not.to.equal(child2);
        expect(copy.getChildren('Base')[2]).not.to.equal(child3);
        expect(copy.getChildren('Base')[0].identifier).to.equal('child1');
        expect(copy.getChildren('Base')[1].identifier).to.equal('child2');
        expect(copy.getChildren('Base')[2].identifier).to.equal('child3');

        expect(copy.getChildren('Base')[0].getChildren('Base').length).to.equal(3);
        expect(copy.getChildren('Base')[0].getChildren('Base')[0]).not.to.equal(grandchild1);
        expect(copy.getChildren('Base')[0].getChildren('Base')[1]).not.to.equal(grandchild2);
        expect(copy.getChildren('Base')[0].getChildren('Base')[2]).not.to.equal(grandchild3);
        expect(copy.getChildren('Base')[0].getChildren('Base')[0].identifier).to.equal('grandchild1');
        expect(copy.getChildren('Base')[0].getChildren('Base')[1].identifier).to.equal('grandchild2');
        expect(copy.getChildren('Base')[0].getChildren('Base')[2].identifier).to.equal('grandchild3');
    });

    it('identifier should only accept valid variable names', function() {
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
        base.identifier = '';
        expect(base.identifier).to.equal(null);

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

    it('identifier should not accept javascript keywords', function() {
        var base = new Wick.Base({identifier: 'dummy'});

        // Invalid names
        base.identifier = 'function';
        expect(base.identifier).to.equal('dummy');
        base.identifier = 'var';
        expect(base.identifier).to.equal('dummy');
        base.identifier = 'null';
        expect(base.identifier).to.equal('dummy');
        base.identifier = 'window';
        expect(base.identifier).to.equal('dummy');
    });

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

    it('should get parent layer correctly', function() {
        var clip = new Wick.Clip();
        var frame = new Wick.Frame();
        var layer = new Wick.Layer();

        expect(clip.parentLayer).to.equal(null);

        frame.addClip(clip);
        layer.addFrame(frame);

        expect(clip.parentLayer).to.equal(layer);
    });

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

    it('should create project references', function() {
        var project = new Wick.Project();
        var base = new Wick.Base();
        var child = new Wick.Base();
        base.addChild(child);
        project.addChild(base);

        expect(base.project).to.equal(project);
        expect(child.project).to.equal(project);
    });

    it('should export/import correctly between projects', function () {
        var base = new Wick.Base({
            identifier: 'parent',
        });

        var child1 = new Wick.Base({identifier:'child1'});
        var child2 = new Wick.Base({identifier:'child2'});
        var child3 = new Wick.Base({identifier:'child3'});

        var grandchild1 = new Wick.Base({identifier:'grandchild1'});
        var grandchild2 = new Wick.Base({identifier:'grandchild2'});
        var grandchild3 = new Wick.Base({identifier:'grandchild3'});

        base.addChild(child1);
        base.addChild(child2);
        base.addChild(child3);

        child1.addChild(grandchild1);
        child1.addChild(grandchild2);
        child1.addChild(grandchild3);

        var exportData = base.export();

        Wick.ObjectCache.clear();

        var newBase = Wick.Base.import(exportData);

        expect(newBase.identifier).to.equal('parent');
        expect(newBase.getChildren()[0].identifier).to.equal('child1');
        expect(newBase.getChildren()[1].identifier).to.equal('child2');
        expect(newBase.getChildren()[2].identifier).to.equal('child3');
        expect(newBase.getChildren()[0].uuid).to.not.equal(child1.uuid);
        expect(newBase.getChildren()[1].uuid).to.not.equal(child2.uuid);
        expect(newBase.getChildren()[2].uuid).to.not.equal(child3.uuid);
        expect(newBase.getChildren()[0].getChildren()[0].identifier).to.equal('grandchild1');
        expect(newBase.getChildren()[0].getChildren()[1].identifier).to.equal('grandchild2');
        expect(newBase.getChildren()[0].getChildren()[2].identifier).to.equal('grandchild3');
        expect(newBase.getChildren()[0].getChildren()[0].uuid).to.not.equal(grandchild1.uuid);
        expect(newBase.getChildren()[0].getChildren()[1].uuid).to.not.equal(grandchild2.uuid);
        expect(newBase.getChildren()[0].getChildren()[2].uuid).to.not.equal(grandchild3.uuid);
    })
});
