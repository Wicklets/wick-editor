describe('Paper.SelectionWidget', function() {
    var printCanvas = (paper, canvas, msg) => {
        paper.view.update();
        var i = new Image();
        i.src = canvas.toDataURL();

        document.body.appendChild(i);

        var title = document.createElement('h3');
        title.style.fontFamily = 'monospace';
        title.innerHTML = msg;
        document.body.appendChild(title);
    }

    it('should build correctly', function () {
        this.timeout(10000);

        var canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 200;
        //document.body.appendChild(canvas);

        var paper = TestUtils.createPaperScope(canvas);
        var activeLayer = paper.project.activeLayer;
        var guiLayer = new paper.Layer();
        var gridLayer = new paper.Layer();
        paper.project.addLayer(new paper.Layer(guiLayer));
        paper.project.addLayer(new paper.Layer(gridLayer));
        activeLayer.activate();

        paper.view.center = paper.view.center.subtract(new paper.Point(30.5,30.5));

        var widget = new paper.SelectionWidget({
            layer: guiLayer,
        });

        var gridCellSize = 50;
        var gridColor = '#666666'
        var grid = new paper.Group({
            children: (() => {
                var children = [];
                for (var x = 0; x < paper.view.bounds.width; x += gridCellSize) {
                    children.push(new paper.Path.Line({
                        from: new paper.Point(x, 0),
                        to: new paper.Point(x, paper.view.bounds.height),
                        strokeColor: gridColor,
                        strokeWidth: 1,
                    }));
                }
                for (var y = 0; y < paper.view.bounds.height; y += gridCellSize) {
                    children.push(new paper.Path.Line({
                        from: new paper.Point(0, y),
                        to: new paper.Point(paper.view.bounds.width, y),
                        strokeColor: gridColor,
                        strokeWidth: 1,
                    }));
                }
                return children;
            })(),
        });
        gridLayer.addChild(grid);

        var ellipse = new paper.Path.Ellipse({
            center: new paper.Point(50,50),
            radius: 50,
            fillColor: 'red',
            strokeColor: 'black',
        });
        var rect = new paper.Path.Rectangle({
            from: new paper.Point(100,0),
            to: new paper.Point(200,100),
            fillColor: 'blue',
            strokeColor: 'black',
        });
        /*
        var group = new paper.Group({
            children: [
                new paper.Path.Rectangle({
                    from: new paper.Point(0,0),
                    to: new paper.Point(50,50),
                    fillColor: 'cyan',
                    strokeColor: 'black',
                }),
                new paper.Path.Rectangle({
                    from: new paper.Point(50,0),
                    to: new paper.Point(100,50),
                    fillColor: 'yellow',
                    strokeColor: 'black',
                }),
                new paper.Path.Rectangle({
                    from: new paper.Point(0,50),
                    to: new paper.Point(50,100),
                    fillColor: 'magenta',
                    strokeColor: 'black',
                }),
                new paper.Path.Rectangle({
                    from: new paper.Point(50,50),
                    to: new paper.Point(100,100),
                    fillColor: 'orange',
                    strokeColor: 'black',
                }),
            ],
            pivot: new paper.Point(0,0),
        });
        group.position.x = 200;
        */

        widget.build({
            items: [ellipse, rect],
            rotation: 0,
            pivot: 'center',
        });
        printCanvas(paper, canvas, 'ellipse and rect selected');

        widget.rotateSelection(45);
        printCanvas(paper, canvas, 'ellipse and rect rotated');

        widget.build({
            items: [ellipse, rect],
            rotation: 45,
            pivot: 'center',
        });
        printCanvas(paper, canvas, 'new selection created with rotation: 45');

        widget.scaleSelection(new paper.Point(0.5, 1.0));
        printCanvas(paper, canvas, 'selection scaled {x: 0.5, y: 1.0}');

        widget.build({
            items: [ellipse, rect],
            rotation: 45,
            pivot: 'center',
        });
        printCanvas(paper, canvas, 'new selection created with rotation: 45');

        widget.translateSelection(new paper.Point(100, 0));
        printCanvas(paper, canvas, 'selection translated {x: 100, y: 0}');

        widget.build({
            items: [ellipse, rect],
            rotation: 45,
            pivot: 'center',
        });
        printCanvas(paper, canvas, 'new selection created with rotation: 45');

        widget.rotateSelection(-45);
        printCanvas(paper, canvas, 'selection rotated -45');

        widget.build({
            items: [ellipse, rect],
            rotation: 0,
            pivot: 'center',
        });
        printCanvas(paper, canvas, 'new selection created with rotation: 0');

        widget.scaleSelection(new paper.Point(2.0, 1.0));
        printCanvas(paper, canvas, 'selection scaled {x: 2.0, y: 1.0}');

        widget.build({
            items: [ellipse, rect],
            rotation: 0,
            pivot: 'center',
        });
        printCanvas(paper, canvas, 'new selection created with rotation: 0');

        widget.translateSelection(new paper.Point(-100, 0));
        printCanvas(paper, canvas, 'selection translated {x: -100, y: 0}');

        widget.build({
            items: [ellipse, rect],
            rotation: 0,
            pivot: 'center',
        });
        printCanvas(paper, canvas, 'new selection created with rotation: 0');
    });
});
