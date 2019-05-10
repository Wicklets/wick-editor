describe('Paper.SelectionWidget', function() {
    var printCanvas = (paper, canvas) => {
        paper.view.update();
        var i = new Image();
        i.src = canvas.toDataURL();
        document.body.appendChild(i);
    }

    var testSelectItems = (widget, canvas, items) => {
        var title = document.createElement('div');
        title.innerHTML = items.length + ' items';
        document.body.appendChild(title);

        for(var angle = -180; angle <= 180; angle += 15) {
            widget.build({
                items: items,
                rotation: angle,
            });
            printCanvas(paper,canvas);
            widget.moveSelection(new paper.Point(10,0));
            printCanvas(paper,canvas);
            widget.moveSelection(new paper.Point(-10,0));
        }
    }

    it('should build correctly', function () {
        var canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 200;

        var paper = TestUtils.createPaperScope(canvas);
        var activeLayer = paper.project.activeLayer;
        var guiLayer = new paper.Layer();
        paper.project.addLayer(new paper.Layer(guiLayer));
        activeLayer.activate();

        paper.view.center = paper.view.center.subtract(new paper.Point(30,30))

        var widget = new paper.SelectionWidget({
            layer: guiLayer,
        });

        var gridCellSize = 50;
        var gridColor = 'rgba(100,100,255,0.5)'
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

        testSelectItems(widget, canvas, [ellipse]);
        testSelectItems(widget, canvas, [ellipse, rect]);
        testSelectItems(widget, canvas, [ellipse, rect, group]);
    });
});
