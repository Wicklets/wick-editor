describe('Paper.SelectionWidget', function() {
    it('should build correctly', function () {
        var canvas = document.createElement('canvas');
        canvas.width = 720;
        canvas.height = 480;
        document.body.appendChild(canvas);

        var paper = TestUtils.createPaperScope(canvas);
        var activeLayer = paper.project.activeLayer;
        var guiLayer = new paper.Layer();
        paper.project.addLayer(new paper.Layer(guiLayer));
        activeLayer.activate();

        paper.view.center = paper.view.center.subtract(new paper.Point(30,30))

        var widget = new paper.SelectionWidget({
            layer: guiLayer,
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

        widget.build();

        expect(widget.item.children.length).to.equal(0);

        widget.build({
            items: [ellipse],
        });

        expect(widget.item.children.length).to.not.equal(0);
        expect(widget.boundingBox.left).to.equal(0);
        expect(widget.boundingBox.top).to.equal(0);
        expect(widget.boundingBox.right).to.equal(100);
        expect(widget.boundingBox.bottom).to.equal(100);

        widget.build({
            items: [ellipse],
            rotation: 45,
        });

        expect(widget.item.children.length).to.not.equal(0);
        expect(widget.boundingBox.left).to.be.closeTo(0, 0.01);
        expect(widget.boundingBox.top).to.be.closeTo(0, 0.01);
        expect(widget.boundingBox.right).to.be.closeTo(100, 0.01);
        expect(widget.boundingBox.bottom).to.be.closeTo(100, 0.01);

        widget.build({
            items: [ellipse, rect],
            rotation: 30,
        });

        /*
        expect(widget.item.children.length).to.not.equal(0);
        expect(widget.boundingBox.left).to.be.closeTo(0, 0.01);
        expect(widget.boundingBox.top).to.be.closeTo(0, 0.01);
        expect(widget.boundingBox.right).to.be.closeTo(100, 0.01);
        expect(widget.boundingBox.bottom).to.be.closeTo(100, 0.01);
        */
    });
});
