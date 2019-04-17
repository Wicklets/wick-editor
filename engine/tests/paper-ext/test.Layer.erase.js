describe('Paper.Layer.erase', function() {
    it('should call erase() on an empty layer with an empty path without errors', function () {
        var layer = new paper.Layer();
        layer.erase(new paper.Path({insert:false}));

        expect(layer.children.length).to.equal(0);
    });

    it('should call erase() on a populated layer with an empty path without errors', function () {
        var layer = new paper.Layer();
        layer.addChild(new paper.Path.Ellipse({
            point: [0, 0],
            size: [50, 50],
            fillColor: 'black'})
        );
        layer.addChild(new paper.Path.Ellipse({
            point: [100, 100],
            size: [50, 50],
            fillColor: 'red'})
        );
        layer.erase(new paper.Path({insert:false}));

        expect(layer.children.length).to.equal(2);
    });

    it('should completely erase a fill without errors', function () {
        var layer = new paper.Layer();
        layer.addChild(new paper.Path.Ellipse({
            center: [50,50],
            size: [10,10],
            fillColor: 'red',
        }));

        var eraserPath = new paper.Path.Rectangle({
            point: new paper.Point(0, 0), 
            size: new paper.Size(100, 100)
        });
        eraserPath.remove();
        layer.erase(eraserPath);

        expect(layer.children.length).to.equal(0);
    });

    it('should completely erase an open stroke without errors', function () {
        var layer = new paper.Layer();
        layer.addChild(new paper.Path.Line({
            from: new paper.Point(20, 20),
            to: new paper.Point(80, 80),
            strokeColor: 'black',
        }));

        var eraserPath = new paper.Path.Rectangle({
            point: new paper.Point(0, 0), 
            size: new paper.Size(100, 100)
        });
        eraserPath.remove();
        layer.erase(eraserPath);

        expect(layer.children.length).to.equal(0);
    });

    it('should completely erase a closed stroke without errors', function () {
        var layer = new paper.Layer();
        layer.addChild(new paper.Path.Ellipse({
            center: [50,50],
            size: [10,10],
            strokeColor: 'red',
        }));

        var eraserPath = new paper.Path.Rectangle({
            point: new paper.Point(0, 0), 
            size: new paper.Size(100, 100)
        });
        eraserPath.remove();
        layer.erase(eraserPath);

        expect(layer.children.length).to.equal(0);
    });

    it('should completely erase a closed filled path without errors', function () {
        var layer = new paper.Layer();
        layer.addChild(new paper.Path.Ellipse({
            center: [50,50],
            size: [10,10],
            strokeColor: 'red',
        }));

        var eraserPath = new paper.Path.Rectangle({
            point: new paper.Point(0, 0), 
            size: new paper.Size(100, 100)
        });
        eraserPath.remove();
        layer.erase(eraserPath);
        
        expect(layer.children.length).to.equal(0);
    });

    it('should partially erase a fill without errors', function () {
        var layer = new paper.Layer();
        layer.addChild(new paper.Path.Ellipse({
            center: [50,50],
            size: [10,10],
            fillColor: 'red',
        }));

        var eraserPath = new paper.Path.Rectangle({
            point: new paper.Point(50, 50), 
            size: new paper.Size(100, 100)
        });
        eraserPath.remove();
        layer.erase(eraserPath);

        expect(layer.children.length).to.equal(1);
    });

    it('should partially erase a closed path without errors', function () {
        var layer = new paper.Layer();
        layer.addChild(new paper.Path.Ellipse({
            center: [50,50],
            size: [10,10],
            strokeColor: 'red',
        }));

        var eraserPath = new paper.Path.Rectangle({
            point: new paper.Point(50, 50), 
            size: new paper.Size(100, 100)
        });
        eraserPath.remove();
        layer.erase(eraserPath);

        expect(layer.children.length).to.equal(1);
    });

    it('should partially erase a closed filled path without errors', function () {
        var layer = new paper.Layer();
        layer.addChild(new paper.Path.Ellipse({
            center: [50,50],
            size: [10,10],
            fillColor: 'black',
            strokeColor: 'red',
        }));

        var eraserPath = new paper.Path.Rectangle({
            point: new paper.Point(50, 50), 
            size: new paper.Size(100, 100)
        });
        eraserPath.remove();
        layer.erase(eraserPath);

        // Note that we expect there to be two children on the layer now,
        // the path must be split into two paths, one for the open stroke
        // and one for the fill.
        expect(layer.children.length).to.equal(2);
    });

    it('should split a fill into two paths by erasing down the middle', function () {
        var layer = new paper.Layer();
        layer.addChild(new paper.Path.Ellipse({
            center: [50,50],
            size: [10,10],
            fillColor: 'black',
        }));

        var eraserPath = new paper.Path.Rectangle({
            point: new paper.Point(50, 0), 
            size: new paper.Size(2, 100)
        });
        eraserPath.remove();
        layer.erase(eraserPath);

        expect(layer.children.length).to.equal(2);
    });

    it('should split a closed stroke into two paths by erasing down the middle', function () {
        var layer = new paper.Layer();
        layer.addChild(new paper.Path.Ellipse({
            center: [50,50],
            size: [10,10],
            strokeColor: 'black',
        }));

        var eraserPath = new paper.Path.Rectangle({
            point: new paper.Point(50, 0), 
            size: new paper.Size(2, 100)
        });
        eraserPath.remove();
        layer.erase(eraserPath);

        expect(layer.children.length).to.equal(2);
    });

    it('should split a closed stroke with a fill into four paths by erasing down the middle', function () {
        var layer = new paper.Layer();
        layer.addChild(new paper.Path.Ellipse({
            center: [50,50],
            size: [10,10],
            fillColor: 'red',
            strokeColor: 'black',
        }));

        var eraserPath = new paper.Path.Rectangle({
            point: new paper.Point(50, 0), 
            size: new paper.Size(2, 100)
        });
        eraserPath.remove();
        layer.erase(eraserPath);

        // Note that we expect there to be four children here,
        // two halves for the stroke, and two halves for the fill
        expect(layer.children.length).to.equal(4);
    });

    it('eraser path should not affect shapes that dont touch the eraser path', function () {
        var layer = new paper.Layer();
        layer.addChild(new paper.Path.Ellipse({
            center: [30,30],
            size: [10,10],
            fillColor: 'red',
            strokeColor: 'black',
        }));
        layer.addChild(new paper.Path.Ellipse({
            center: [50,30],
            size: [10,10],
            fillColor: 'red',
            strokeColor: 'black',
        }));
        layer.addChild(new paper.Path.Ellipse({
            center: [70,30],
            size: [10,10],
            fillColor: 'red',
            strokeColor: 'black',
        }));

        var eraserPath = new paper.Path.Rectangle({
            point: new paper.Point(0, 0), 
            size: new paper.Size(5, 5)
        });
        eraserPath.remove();
        layer.erase(eraserPath);
        
        expect(layer.children.length).to.equal(3);
    });

    it('should completely erase 100 paths without error', function () {
        var layer = new paper.Layer();
        for(var x = 0; x < 10; x ++) {
            for(var y = 0; y < 10; y ++) {
                layer.addChild(new paper.Path.Ellipse({
                    center: [x*10,y*10],
                    size: [10,10],
                    fillColor: 'black',
                    strokeColor: 'black',
                }));
            }
        }

        var eraserPath = new paper.Path.Rectangle({
            point: new paper.Point(-100, -100), 
            size: new paper.Size(200, 200)
        });
        eraserPath.remove();
        layer.erase(eraserPath);
        
        expect(layer.children.length).to.equal(0);
    });

    it('should partially erase 100 paths without error', function () {
        var layer = new paper.Layer();
        for(var i = 0; i < 100; i ++) {
            layer.addChild(new paper.Path.Ellipse({
                center: [50, 50],
                size: [10,10],
                fillColor: 'black',
            }));
        }

        var eraserPath = new paper.Path.Rectangle({
            point: new paper.Point(50, 50), 
            size: new paper.Size(50, 50)
        });
        eraserPath.remove();
        layer.erase(eraserPath);
        
        expect(layer.children.length).to.equal(100);
    });
});
