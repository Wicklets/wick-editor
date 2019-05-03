describe('Paper.Selection', function() {
    let createDummyPaperInstance = () => {
        var paperScope = TestUtils.createPaperScope();

        //  ---   ---
        // |p1 | |p2 |
        //  ---   ---
        //        ---
        //       |p3 |
        //        ---

        var path1 = new paperScope.Path.Ellipse({
            center: new paper.Point(25,25),
            radius: 25,
            fillColor: '#ff0000',
            applyMatrix: true,
        });
        var path2 = new paperScope.Path.Ellipse({
            center: new paper.Point(75,25),
            radius: 25,
            fillColor: '#00ff00',
            applyMatrix: true,
        });
        var path3 = new paperScope.Group({
            children: [
                new paperScope.Path.Ellipse({
                    center: new paper.Point(0,0),
                    radius: 25,
                    fillColor: '#0000ff',
                    applyMatrix: true,
                })
            ],
            applyMatrix: false,
        })
        path3.position.x = 75;
        path3.position.y = 75;

        return {
            paperScope: paperScope,
            path1: path1,
            path2: path2,
            path3: path3,
        };
    }

    let createDummyPaperInstanceForOrdering = () => {
        var paperScope = TestUtils.createPaperScope();

        //  ---   ---
        // |p1 | |p2 |
        //  ---   ---
        //        ---
        //       |p3 |
        //        ---

        var path1 = new paperScope.Path.Ellipse({
            center: new paper.Point(0,0),
            radius: 25,
            fillColor: '#ff0000',
            applyMatrix: true,
        });
        var path2 = new paperScope.Path.Ellipse({
            center: new paper.Point(20,20),
            radius: 25,
            fillColor: '#00ff00',
            applyMatrix: true,
        });
        var path3 = new paperScope.Path.Ellipse({
            center: new paper.Point(40,40),
            radius: 25,
            fillColor: '#0000ff',
            applyMatrix: true,
        });
        var path4 = new paperScope.Path.Ellipse({
            center: new paper.Point(60,60),
            radius: 25,
            fillColor: '#ff00ff',
            applyMatrix: true,
        });
        var path5 = new paperScope.Path.Ellipse({
            center: new paper.Point(80,80),
            radius: 25,
            fillColor: '#ffff00',
            applyMatrix: true,
        });

        var guiLayer = new paperScope.Layer();
        paperScope.project.addLayer(guiLayer);

        var contentLayer = new paperScope.Layer();
        paperScope.project.addLayer(contentLayer);
        contentLayer.addChild(path1);
        contentLayer.addChild(path2);
        contentLayer.addChild(path3);
        contentLayer.addChild(path4);
        contentLayer.addChild(path5);

        return {
            paperScope: paperScope,
            guiLayer: guiLayer,
            contentLayer: contentLayer,
            path1: path1,
            path2: path2,
            path3: path3,
            path4: path4,
            path5: path5,
        };
    }

    let createDummyPaperInstanceForPathAttributes = () => {
        var paperScope = TestUtils.createPaperScope();

        //  ---   ---
        // |p1 | |p2 |
        //  ---   ---
        //        ---
        //       |p3 |
        //        ---

        var path1 = new paperScope.Path.Ellipse({
            center: new paper.Point(0,0),
            radius: 25,
            fillColor: '#ff0000',
            strokeColor: '#000000',
            strokeWidth: 1,
            applyMatrix: true,
        });
        var path2 = new paperScope.Path.Ellipse({
            center: new paper.Point(20,20),
            radius: 25,
            fillColor: '#00ff00',
            strokeColor: '#000000',
            strokeWidth: 2,
            applyMatrix: true,
        });
        var path3 = new paperScope.Path.Ellipse({
            center: new paper.Point(40,40),
            radius: 25,
            fillColor: '#0000ff',
            strokeColor: '#000000',
            strokeWidth: 3,
            applyMatrix: true,
        });
        var path4 = new paperScope.Path.Ellipse({
            center: new paper.Point(60,60),
            radius: 25,
            fillColor: '#ff00ff',
            strokeColor: '#ffffff',
            strokeWidth: 4,
            applyMatrix: true,
        });
        var path5 = new paperScope.Path.Ellipse({
            center: new paper.Point(80,80),
            radius: 25,
            fillColor: '#ffff00',
            strokeColor: '#ffffff',
            strokeWidth: 5,
            applyMatrix: true,
        });

        var guiLayer = new paperScope.Layer();
        paperScope.project.addLayer(guiLayer);

        var contentLayer = new paperScope.Layer();
        paperScope.project.addLayer(contentLayer);
        contentLayer.addChild(path1);
        contentLayer.addChild(path2);
        contentLayer.addChild(path3);
        contentLayer.addChild(path4);
        contentLayer.addChild(path5);

        return {
            paperScope: paperScope,
            guiLayer: guiLayer,
            contentLayer: contentLayer,
            path1: path1,
            path2: path2,
            path3: path3,
            path4: path4,
            path5: path5,
        };
    }

    describe('constructor', function () {
        it('should instantiate correctly', function () {
            var dummy = createDummyPaperInstance();
            var paperScope = dummy.paperScope;

            var selection = new paperScope.Selection({
                layer: paperScope.project.activeLayer
            });

            expect(selection.layer).to.equal(paperScope.project.activeLayer);
            expect(selection.items).to.eql([]);
            expect(selection.transformation.x).to.equal(0);
            expect(selection.transformation.y).to.equal(0);
            expect(selection.transformation.scaleX).to.equal(1.0);
            expect(selection.transformation.scaleY).to.equal(1.0);
            expect(selection.transformation.rotation).to.equal(0);
            expect(selection.transformation.originX).to.equal(0);
            expect(selection.transformation.originY).to.equal(0);
            expect(selection.position.x).to.equal(0);
            expect(selection.position.y).to.equal(0);
            expect(selection.origin.x).to.equal(0);
            expect(selection.origin.y).to.equal(0);

            selection.finish();
        });
    });

    describe('transformations', function () {
        it('no initial transformations, no transformations given, discard transformations', function () {
            var dummy = createDummyPaperInstance();

            var paperScope = dummy.paperScope;
            var path1 = dummy.path1;
            var path2 = dummy.path2;
            var path3 = dummy.path3;

            var selection = new paperScope.Selection({
                layer: paperScope.project.activeLayer,
                items: [path1, path2, path3],
            });

            expect(selection.layer).to.equal(paperScope.project.activeLayer);
            expect(selection.items).to.eql([path1, path2, path3]);
            expect(selection.transformation.x).to.equal(0);
            expect(selection.transformation.y).to.equal(0);
            expect(selection.transformation.scaleX).to.equal(1.0);
            expect(selection.transformation.scaleY).to.equal(1.0);
            expect(selection.transformation.rotation).to.equal(0);
            expect(selection.transformation.originX).to.equal(50);
            expect(selection.transformation.originY).to.equal(50);
            expect(selection.position.x).to.equal(0);
            expect(selection.position.y).to.equal(0);
            expect(selection.origin.x).to.equal(50);
            expect(selection.origin.y).to.equal(50);

            selection.finish({discardTransformation:true});

            expect(path1.bounds.top).to.equal(0);
            expect(path1.bounds.bottom).to.equal(50);
            expect(path1.bounds.left).to.equal(0);
            expect(path1.bounds.right).to.equal(50);
            expect(path2.bounds.top).to.equal(0);
            expect(path2.bounds.bottom).to.equal(50);
            expect(path2.bounds.left).to.equal(50);
            expect(path2.bounds.right).to.equal(100);
            expect(path3.bounds.top).to.equal(50);
            expect(path3.bounds.bottom).to.equal(100);
            expect(path3.bounds.left).to.equal(50);
            expect(path3.bounds.right).to.equal(100);
        });

        it('no initial transformations, some transformations given, discard transformations', function () {
            var dummy = createDummyPaperInstance();

            var paperScope = dummy.paperScope;
            var path1 = dummy.path1;
            var path2 = dummy.path2;
            var path3 = dummy.path3;

            var selection = new paperScope.Selection({
                layer: paperScope.project.activeLayer,
                items: [path1, path2, path3],
            });

            selection.updateTransformation({
                x: 100
            });

            expect(selection.layer).to.equal(paperScope.project.activeLayer);
            expect(selection.items).to.eql([path1, path2, path3]);
            expect(selection.transformation.x).to.equal(100);
            expect(selection.transformation.y).to.equal(0);
            expect(selection.transformation.scaleX).to.equal(1.0);
            expect(selection.transformation.scaleY).to.equal(1.0);
            expect(selection.transformation.rotation).to.equal(0);
            expect(selection.transformation.originX).to.equal(50);
            expect(selection.transformation.originY).to.equal(50);
            expect(selection.origin.x).to.equal(150);
            expect(selection.origin.y).to.equal(50);
            expect(selection.position.x).to.equal(100);
            expect(selection.position.y).to.equal(0);

            selection.finish({discardTransformation:true});

            expect(path1.bounds.top).to.equal(0);
            expect(path1.bounds.bottom).to.equal(50);
            expect(path1.bounds.left).to.equal(0);
            expect(path1.bounds.right).to.equal(50);
            expect(path2.bounds.top).to.equal(0);
            expect(path2.bounds.bottom).to.equal(50);
            expect(path2.bounds.left).to.equal(50);
            expect(path2.bounds.right).to.equal(100);
            expect(path3.bounds.top).to.equal(50);
            expect(path3.bounds.bottom).to.equal(100);
            expect(path3.bounds.left).to.equal(50);
            expect(path3.bounds.right).to.equal(100);
        });

        it('no initial transformations, some transformations given, apply transformations', function () {
            var dummy = createDummyPaperInstance();

            var paperScope = dummy.paperScope;
            var path1 = dummy.path1;
            var path2 = dummy.path2;
            var path3 = dummy.path3;

            var selection = new paperScope.Selection({
                layer: paperScope.project.activeLayer,
                items: [path1, path2, path3],
            });

            selection.updateTransformation({
                x: 100
            });

            expect(selection.layer).to.equal(paperScope.project.activeLayer);
            expect(selection.items).to.eql([path1, path2, path3]);
            expect(selection.transformation.x).to.equal(100);
            expect(selection.transformation.y).to.equal(0);
            expect(selection.transformation.scaleX).to.equal(1.0);
            expect(selection.transformation.scaleY).to.equal(1.0);
            expect(selection.transformation.rotation).to.equal(0);
            expect(selection.transformation.originX).to.equal(50);
            expect(selection.transformation.originY).to.equal(50);
            expect(selection.origin.x).to.equal(150);
            expect(selection.origin.y).to.equal(50);
            expect(selection.position.x).to.equal(100);
            expect(selection.position.y).to.equal(0);

            selection.finish({discardTransformation:false});

            expect(path1.bounds.top).to.equal(0);
            expect(path1.bounds.bottom).to.equal(50);
            expect(path1.bounds.left).to.equal(0 + 100);
            expect(path1.bounds.right).to.equal(50 + 100);
            expect(path2.bounds.top).to.equal(0);
            expect(path2.bounds.bottom).to.equal(50);
            expect(path2.bounds.left).to.equal(50 + 100);
            expect(path2.bounds.right).to.equal(100 + 100);
            expect(path3.bounds.top).to.equal(50);
            expect(path3.bounds.bottom).to.equal(100);
            expect(path3.bounds.left).to.equal(50 + 100);
            expect(path3.bounds.right).to.equal(100 + 100);
        });

        it('some initial transformations, no transformations given, apply transformations', function () {
            var dummy = createDummyPaperInstance();

            var paperScope = dummy.paperScope;
            var path1 = dummy.path1;
            var path2 = dummy.path2;
            var path3 = dummy.path3;

            var selection = new paperScope.Selection({
                layer: paperScope.project.activeLayer,
                items: [path1, path2, path3],
                x: 100,
            });

            expect(path1.bounds.top).to.equal(0);
            expect(path1.bounds.bottom).to.equal(50);
            expect(path1.bounds.left).to.equal(0 + 100);
            expect(path1.bounds.right).to.equal(50 + 100);
            expect(path2.bounds.top).to.equal(0);
            expect(path2.bounds.bottom).to.equal(50);
            expect(path2.bounds.left).to.equal(50 + 100);
            expect(path2.bounds.right).to.equal(100 + 100);
            expect(path3.bounds.top).to.equal(50);
            expect(path3.bounds.bottom).to.equal(100);
            expect(path3.bounds.left).to.equal(50 + 100);
            expect(path3.bounds.right).to.equal(100 + 100);

            selection.finish({discardTransformation:false});

            expect(path1.bounds.top).to.equal(0);
            expect(path1.bounds.bottom).to.equal(50);
            expect(path1.bounds.left).to.equal(0 + 100);
            expect(path1.bounds.right).to.equal(50 + 100);
            expect(path2.bounds.top).to.equal(0);
            expect(path2.bounds.bottom).to.equal(50);
            expect(path2.bounds.left).to.equal(50 + 100);
            expect(path2.bounds.right).to.equal(100 + 100);
            expect(path3.bounds.top).to.equal(50);
            expect(path3.bounds.bottom).to.equal(100);
            expect(path3.bounds.left).to.equal(50 + 100);
            expect(path3.bounds.right).to.equal(100 + 100);
        });

        it('some initial transformations, no transformations given, discard transformations', function () {
            var dummy = createDummyPaperInstance();

            var paperScope = dummy.paperScope;
            var path1 = dummy.path1;
            var path2 = dummy.path2;
            var path3 = dummy.path3;

            var selection = new paperScope.Selection({
                layer: paperScope.project.activeLayer,
                items: [path1, path2, path3],
                x: 100,
            });

            expect(path1.bounds.top).to.equal(0);
            expect(path1.bounds.bottom).to.equal(50);
            expect(path1.bounds.left).to.equal(0 + 100);
            expect(path1.bounds.right).to.equal(50 + 100);
            expect(path2.bounds.top).to.equal(0);
            expect(path2.bounds.bottom).to.equal(50);
            expect(path2.bounds.left).to.equal(50 + 100);
            expect(path2.bounds.right).to.equal(100 + 100);
            expect(path3.bounds.top).to.equal(50);
            expect(path3.bounds.bottom).to.equal(100);
            expect(path3.bounds.left).to.equal(50 + 100);
            expect(path3.bounds.right).to.equal(100 + 100);

            selection.finish({discardTransformation:true});

            expect(path1.bounds.top).to.equal(0);
            expect(path1.bounds.bottom).to.equal(50);
            expect(path1.bounds.left).to.equal(0);
            expect(path1.bounds.right).to.equal(50);
            expect(path2.bounds.top).to.equal(0);
            expect(path2.bounds.bottom).to.equal(50);
            expect(path2.bounds.left).to.equal(50);
            expect(path2.bounds.right).to.equal(100);
            expect(path3.bounds.top).to.equal(50);
            expect(path3.bounds.bottom).to.equal(100);
            expect(path3.bounds.left).to.equal(50);
            expect(path3.bounds.right).to.equal(100);
        });
    });

    describe('attributes', function () {
        it('should manually update transformation attributes (position)', function () {
            var dummy = createDummyPaperInstance();

            var paperScope = dummy.paperScope;
            var path1 = dummy.path1;
            var path2 = dummy.path2;
            var path3 = dummy.path3;

            var selection = new paperScope.Selection({
                layer: paperScope.project.activeLayer,
                items: [path1, path2, path3],
            });

            expect(selection.position.x).to.equal(0);
            expect(selection.position.y).to.equal(0);
            expect(selection.origin.x).to.equal(50);
            expect(selection.origin.y).to.equal(50);

            selection.position = new paper.Point(100,200);

            expect(selection.position.x).to.equal(100);
            expect(selection.position.y).to.equal(200);
            expect(selection.origin.x).to.equal(50 + 100);
            expect(selection.origin.y).to.equal(50 + 200);
        });

        it('should manually update transformation attributes (origin)', function () {
            var dummy = createDummyPaperInstance();

            var paperScope = dummy.paperScope;
            var path1 = dummy.path1;
            var path2 = dummy.path2;
            var path3 = dummy.path3;

            var selection = new paperScope.Selection({
                layer: paperScope.project.activeLayer,
                items: [path1, path2, path3],
            });

            expect(selection.position.x).to.equal(0);
            expect(selection.position.y).to.equal(0);
            expect(selection.origin.x).to.equal(50);
            expect(selection.origin.y).to.equal(50);

            selection.origin = new paper.Point(100,200);

            expect(selection.position.x).to.equal(100 - 50);
            expect(selection.position.y).to.equal(200 - 50);
            expect(selection.origin.x).to.equal(100);
            expect(selection.origin.y).to.equal(200);
        });

        it('should manually update transformation attributes (width)', function () {
            var dummy = createDummyPaperInstance();

            var paperScope = dummy.paperScope;
            var path1 = dummy.path1;
            var path2 = dummy.path2;
            var path3 = dummy.path3;

            var selection = new paperScope.Selection({
                layer: paperScope.project.activeLayer,
                items: [path1, path2, path3],
            });

            expect(selection.width).to.equal(100);
            expect(selection.scaleX).to.equal(1);

            selection.width = 200;

            expect(selection.width).to.equal(200);
            expect(selection.scaleX).to.equal(2);

            selection.width = 50;

            expect(selection.width).to.equal(50);
            expect(selection.scaleX).to.equal(0.5);

            selection.width = 25;

            expect(selection.width).to.equal(25);
            expect(selection.scaleX).to.equal(0.25);
        });

        it('should manually update transformation attributes (height)', function () {
            var dummy = createDummyPaperInstance();

            var paperScope = dummy.paperScope;
            var path1 = dummy.path1;
            var path2 = dummy.path2;
            var path3 = dummy.path3;

            var selection = new paperScope.Selection({
                layer: paperScope.project.activeLayer,
                items: [path1, path2, path3],
            });

            expect(selection.height).to.equal(100);
            expect(selection.scaleY).to.equal(1);

            selection.height = 200;

            expect(selection.height).to.equal(200);
            expect(selection.scaleY).to.equal(2);

            selection.height = 50;

            expect(selection.height).to.equal(50);
            expect(selection.scaleY).to.equal(0.5);

            selection.height = 25;

            expect(selection.height).to.equal(25);
            expect(selection.scaleY).to.equal(0.25);
        });

        it('should manually update transformation attributes (scaleX)', function () {
            var dummy = createDummyPaperInstance();

            var paperScope = dummy.paperScope;
            var path1 = dummy.path1;
            var path2 = dummy.path2;
            var path3 = dummy.path3;

            var selection = new paperScope.Selection({
                layer: paperScope.project.activeLayer,
                items: [path1, path2, path3],
            });

            expect(selection.width).to.equal(100);
            expect(selection.scaleX).to.equal(1);

            selection.scaleX = 2.0;

            expect(selection.width).to.equal(200);
            expect(selection.scaleX).to.equal(2);

            selection.scaleX = 0.5;

            expect(selection.width).to.equal(50);
            expect(selection.scaleX).to.equal(0.5);

            selection.scaleX = 0.25;

            expect(selection.width).to.equal(25);
            expect(selection.scaleX).to.equal(0.25);
        });

        it('should manually update transformation attributes (scaleY)', function () {
            var dummy = createDummyPaperInstance();

            var paperScope = dummy.paperScope;
            var path1 = dummy.path1;
            var path2 = dummy.path2;
            var path3 = dummy.path3;

            var selection = new paperScope.Selection({
                layer: paperScope.project.activeLayer,
                items: [path1, path2, path3],
            });

            expect(selection.height).to.equal(100);
            expect(selection.scaleY).to.equal(1);

            selection.scaleY = 2.0;

            expect(selection.height).to.equal(200);
            expect(selection.scaleY).to.equal(2);

            selection.scaleY = 0.5;

            expect(selection.height).to.equal(50);
            expect(selection.scaleY).to.equal(0.5);

            selection.scaleY = 0.25;

            expect(selection.height).to.equal(25);
            expect(selection.scaleY).to.equal(0.25);
        });

        it('should manually update transformation attributes (rotation)', function () {
            var dummy = createDummyPaperInstance();

            var paperScope = dummy.paperScope;
            var path1 = dummy.path1;
            var path2 = dummy.path2;
            var path3 = dummy.path3;

            var selection = new paperScope.Selection({
                layer: paperScope.project.activeLayer,
                items: [path1, path2, path3],
            });

            expect(selection.rotation).to.equal(0);
            selection.rotation = 90;
            expect(selection.rotation).to.equal(90);
        });
    });

    describe('flipping', function () {
        it('should flip horizontally', function () {
            var dummy = createDummyPaperInstance();

            var paperScope = dummy.paperScope;
            var path1 = dummy.path1;
            var path2 = dummy.path2;
            var path3 = dummy.path3;

            var selection = new paperScope.Selection({
                layer: paperScope.project.activeLayer,
                items: [path1, path2, path3],
            });

            expect(selection.scaleX).to.equal(1);

            selection.flipHorizontally();

            expect(selection.scaleX).to.equal(-1);

            selection.scaleX = -2;
            selection.flipHorizontally();

            expect(selection.scaleX).to.equal(2);
        });

        it('should flip vertically', function () {
            var dummy = createDummyPaperInstance();

            var paperScope = dummy.paperScope;
            var path1 = dummy.path1;
            var path2 = dummy.path2;
            var path3 = dummy.path3;

            var selection = new paperScope.Selection({
                layer: paperScope.project.activeLayer,
                items: [path1, path2, path3],
            });

            expect(selection.scaleY).to.equal(1);

            selection.flipVertically();

            expect(selection.scaleY).to.equal(-1);
            selection.scaleY = -2;
            selection.flipVertically();

            expect(selection.scaleY).to.equal(2);
        });
    });

    describe('ordering', function () {
        it('should move forwards (single object)', function () {
            var dummy = createDummyPaperInstanceForOrdering();

            var paperScope = dummy.paperScope;
            var guiLayer = dummy.guiLayer;
            var contentLayer = dummy.contentLayer;
            var path1 = dummy.path1;
            var path2 = dummy.path2;
            var path3 = dummy.path3;
            var path4 = dummy.path4;
            var path5 = dummy.path5;

            var selection = new paperScope.Selection({
                layer: guiLayer,
                items: [path3],
            });

            selection.moveForwards();

            expect(contentLayer.children.length).to.equal(5);
            expect(contentLayer.children[0].id).to.equal(path1.id);
            expect(contentLayer.children[1].id).to.equal(path2.id);
            expect(contentLayer.children[2].id).to.equal(path4.id);
            expect(contentLayer.children[3].id).to.equal(path3.id);
            expect(contentLayer.children[4].id).to.equal(path5.id);
        });

        it('should move backwards (single object)', function () {
            var dummy = createDummyPaperInstanceForOrdering();

            var paperScope = dummy.paperScope;
            var guiLayer = dummy.guiLayer;
            var contentLayer = dummy.contentLayer;
            var path1 = dummy.path1;
            var path2 = dummy.path2;
            var path3 = dummy.path3;
            var path4 = dummy.path4;
            var path5 = dummy.path5;

            var selection = new paperScope.Selection({
                layer: guiLayer,
                items: [path3],
            });

            selection.moveBackwards();

            expect(contentLayer.children.length).to.equal(5);
            expect(contentLayer.children[0].id).to.equal(path1.id);
            expect(contentLayer.children[1].id).to.equal(path3.id);
            expect(contentLayer.children[2].id).to.equal(path2.id);
            expect(contentLayer.children[3].id).to.equal(path4.id);
            expect(contentLayer.children[4].id).to.equal(path5.id);
        });

        it('should bring to front (single object)', function () {
            var dummy = createDummyPaperInstanceForOrdering();

            var paperScope = dummy.paperScope;
            var guiLayer = dummy.guiLayer;
            var contentLayer = dummy.contentLayer;
            var path1 = dummy.path1;
            var path2 = dummy.path2;
            var path3 = dummy.path3;
            var path4 = dummy.path4;
            var path5 = dummy.path5;

            var selection = new paperScope.Selection({
                layer: guiLayer,
                items: [path3],
            });

            selection.bringToFront();

            expect(contentLayer.children.length).to.equal(5);
            expect(contentLayer.children[0].id).to.equal(path1.id);
            expect(contentLayer.children[1].id).to.equal(path2.id);
            expect(contentLayer.children[2].id).to.equal(path4.id);
            expect(contentLayer.children[3].id).to.equal(path5.id);
            expect(contentLayer.children[4].id).to.equal(path3.id);
        });

        it('should send to back (single object)', function () {
            var dummy = createDummyPaperInstanceForOrdering();

            var paperScope = dummy.paperScope;
            var guiLayer = dummy.guiLayer;
            var contentLayer = dummy.contentLayer;
            var path1 = dummy.path1;
            var path2 = dummy.path2;
            var path3 = dummy.path3;
            var path4 = dummy.path4;
            var path5 = dummy.path5;

            var selection = new paperScope.Selection({
                layer: guiLayer,
                items: [path3],
            });

            selection.sendToBack();

            expect(contentLayer.children.length).to.equal(5);
            expect(contentLayer.children[0].id).to.equal(path3.id);
            expect(contentLayer.children[1].id).to.equal(path1.id);
            expect(contentLayer.children[2].id).to.equal(path2.id);
            expect(contentLayer.children[3].id).to.equal(path4.id);
            expect(contentLayer.children[4].id).to.equal(path5.id);
        });

        it('should move forwards (multiple objects)', function () {
            var dummy = createDummyPaperInstanceForOrdering();

            var paperScope = dummy.paperScope;
            var guiLayer = dummy.guiLayer;
            var contentLayer = dummy.contentLayer;
            var path1 = dummy.path1;
            var path2 = dummy.path2;
            var path3 = dummy.path3;
            var path4 = dummy.path4;
            var path5 = dummy.path5;

            var selection = new paperScope.Selection({
                layer: guiLayer,
                items: [path2, path3],
            });

            selection.moveForwards();

            expect(contentLayer.children.length).to.equal(5);
            expect(contentLayer.children[0].id).to.equal(path1.id);
            expect(contentLayer.children[1].id).to.equal(path4.id);
            expect(contentLayer.children[2].id).to.equal(path2.id);
            expect(contentLayer.children[3].id).to.equal(path3.id);
            expect(contentLayer.children[4].id).to.equal(path5.id);
        });

        it('should move backwards (multiple objects)', function () {
            var dummy = createDummyPaperInstanceForOrdering();

            var paperScope = dummy.paperScope;
            var guiLayer = dummy.guiLayer;
            var contentLayer = dummy.contentLayer;
            var path1 = dummy.path1;
            var path2 = dummy.path2;
            var path3 = dummy.path3;
            var path4 = dummy.path4;
            var path5 = dummy.path5;

            var selection = new paperScope.Selection({
                layer: guiLayer,
                items: [path3, path4],
            });

            selection.moveBackwards();

            expect(contentLayer.children.length).to.equal(5);
            expect(contentLayer.children[0].id).to.equal(path1.id);
            expect(contentLayer.children[1].id).to.equal(path3.id);
            expect(contentLayer.children[2].id).to.equal(path4.id);
            expect(contentLayer.children[3].id).to.equal(path2.id);
            expect(contentLayer.children[4].id).to.equal(path5.id);
        });

        it('should bring to front (multiple objects)', function () {
            var dummy = createDummyPaperInstanceForOrdering();

            var paperScope = dummy.paperScope;
            var guiLayer = dummy.guiLayer;
            var contentLayer = dummy.contentLayer;
            var path1 = dummy.path1;
            var path2 = dummy.path2;
            var path3 = dummy.path3;
            var path4 = dummy.path4;
            var path5 = dummy.path5;

            var selection = new paperScope.Selection({
                layer: guiLayer,
                items: [path2, path3],
            });

            selection.bringToFront();

            expect(contentLayer.children.length).to.equal(5);
            expect(contentLayer.children[0].id).to.equal(path1.id);
            expect(contentLayer.children[1].id).to.equal(path4.id);
            expect(contentLayer.children[2].id).to.equal(path5.id);
            expect(contentLayer.children[3].id).to.equal(path2.id);
            expect(contentLayer.children[4].id).to.equal(path3.id);
        });

        it('should send to back (multiple objects)', function () {
            var dummy = createDummyPaperInstanceForOrdering();

            var paperScope = dummy.paperScope;
            var guiLayer = dummy.guiLayer;
            var contentLayer = dummy.contentLayer;
            var path1 = dummy.path1;
            var path2 = dummy.path2;
            var path3 = dummy.path3;
            var path4 = dummy.path4;
            var path5 = dummy.path5;

            var selection = new paperScope.Selection({
                layer: guiLayer,
                items: [path3, path4],
            });

            selection.sendToBack();

            expect(contentLayer.children.length).to.equal(5);
            expect(contentLayer.children[0].id).to.equal(path3.id);
            expect(contentLayer.children[1].id).to.equal(path4.id);
            expect(contentLayer.children[2].id).to.equal(path1.id);
            expect(contentLayer.children[3].id).to.equal(path2.id);
            expect(contentLayer.children[4].id).to.equal(path5.id);
        });
    });

    describe('nudging', function () {
        it('should nudge selection', function () {
            var dummy = createDummyPaperInstance();

            var paperScope = dummy.paperScope;
            var path1 = dummy.path1;
            var path2 = dummy.path2;
            var path3 = dummy.path3;

            var selection = new paperScope.Selection({
                layer: paperScope.project.activeLayer,
                items: [path1, path2, path3],
            });

            expect(selection.position.x).to.equal(0);
            expect(selection.position.y).to.equal(0);

            selection.nudge(10, 10);

            expect(selection.position.x).to.equal(10);
            expect(selection.position.y).to.equal(10);

            selection.nudge(0, 10);

            expect(selection.position.x).to.equal(10);
            expect(selection.position.y).to.equal(20);

            selection.nudge(10, 0);

            expect(selection.position.x).to.equal(20);
            expect(selection.position.y).to.equal(20);
        });
    });

    describe('path attributes', function () {
        it('should update fillColor (one path)', function () {
            var dummy = createDummyPaperInstanceForPathAttributes();

            var paperScope = dummy.paperScope;
            var guiLayer = dummy.guiLayer;
            var contentLayer = dummy.contentLayer;
            var path1 = dummy.path1;
            var path2 = dummy.path2;
            var path3 = dummy.path3;
            var path4 = dummy.path4;
            var path5 = dummy.path5;

            var selection = new paperScope.Selection({
                layer: guiLayer,
                items: [path1],
            });

            expect(selection.fillColor.toCSS(true)).to.equal('#ff0000');
            selection.fillColor = '#0000ff';
            expect(selection.fillColor.toCSS(true)).to.equal('#0000ff');
            expect(path1.fillColor.toCSS(true)).to.equal('#0000ff');
        });

        it('should update strokeColor (one path)', function () {
            var dummy = createDummyPaperInstanceForPathAttributes();

            var paperScope = dummy.paperScope;
            var guiLayer = dummy.guiLayer;
            var contentLayer = dummy.contentLayer;
            var path1 = dummy.path1;
            var path2 = dummy.path2;
            var path3 = dummy.path3;
            var path4 = dummy.path4;
            var path5 = dummy.path5;

            var selection = new paperScope.Selection({
                layer: guiLayer,
                items: [path1],
            });

            expect(selection.strokeColor.toCSS(true)).to.equal('#000000');
            selection.strokeColor = '#ffffff';
            expect(selection.strokeColor.toCSS(true)).to.equal('#ffffff');
            expect(path1.strokeColor.toCSS(true)).to.equal('#ffffff');
        });

        it('should update strokeWidth (one path)', function () {
            var dummy = createDummyPaperInstanceForPathAttributes();

            var paperScope = dummy.paperScope;
            var guiLayer = dummy.guiLayer;
            var contentLayer = dummy.contentLayer;
            var path1 = dummy.path1;
            var path2 = dummy.path2;
            var path3 = dummy.path3;
            var path4 = dummy.path4;
            var path5 = dummy.path5;

            var selection = new paperScope.Selection({
                layer: guiLayer,
                items: [path1],
            });

            expect(selection.strokeWidth).to.equal(1);
            selection.strokeWidth = 3;
            expect(selection.strokeWidth).to.equal(3);
            expect(path1.strokeWidth).to.equal(3);
        });
    });

    describe('scale/rotation handles', function () {
        it('should scale selection', function () {
            var dummy = createDummyPaperInstance();

            var paperScope = dummy.paperScope;
            var path1 = dummy.path1;
            var path2 = dummy.path2;
            var path3 = dummy.path3;

            var selection = new paperScope.Selection({
                layer: paperScope.project.activeLayer,
                items: [path1, path2, path3],
            });

            selection.moveHandleAndScale('bottomRight', new paper.Point(100,100));
            expect(selection.scaleX).to.equal(1);
            expect(selection.scaleY).to.equal(1);

            selection.moveHandleAndScale('bottomRight', new paper.Point(150,100));
            expect(selection.scaleX).to.equal(2);
            expect(selection.scaleY).to.equal(1);
        });
    });
});
