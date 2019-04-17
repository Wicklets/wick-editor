describe('Paper.Layer.hole', function() {
    it('should give NO_PATHS error on blank layer', function (done) {
        var layer = new paper.Layer();
        layer.hole({
            point: new paper.Point(5,5),
            onFinish: function () {
                throw new Error('onFinish was called, this should not happen.');
            },
            onError: function (message) {
                expect(message).to.equal('NO_PATHS');
                expect(layer.children.length).to.equal(0);
                done();
            },
        });
    });

    it('should give OUT_OF_BOUNDS error if the point is outside the bounding area of the shapes on the layer', function (done) {
        var layer = new paper.Layer();
        layer.addChild(new paper.Path.Rectangle({
            from: [0, 0],
            to: [50, 50],
            strokeColor: 'black'
        }))

        layer.hole({
            point: new paper.Point(60,60),
            onFinish: function () {
                throw new Error('onFinish was called, this should not happen.');
            },
            onError: function (message) {
                expect(message).to.equal('OUT_OF_BOUNDS');
                expect(layer.children.length).to.equal(1);
                done();
            },
        });
    });

    it('should give OUT_OF_BOUNDS error if the point is not on the canvas', function (done) {
        var layer = new paper.Layer();
        layer.addChild(new paper.Path.Rectangle({
            from: [0, 0],
            to: [50, 50],
            strokeColor: 'black'
        }))

        layer.hole({
            point: new paper.Point(1000,1000),
            onFinish: function () {
                throw new Error('onFinish was called, this should not happen.');
            },
            onError: function (message) {
                expect(message).to.equal('OUT_OF_BOUNDS');
                expect(layer.children.length).to.equal(1);
                done();
            },
        });
    });

    it('should give OUT_OF_BOUNDS error if the point is not on the canvas (negtive)', function (done) {
        var layer = new paper.Layer();
        layer.addChild(new paper.Path.Rectangle({
            from: [0, 0],
            to: [50, 50],
            strokeColor: 'black'
        }))

        layer.hole({
            point: new paper.Point(-1000,-1000),
            onFinish: function () {
                throw new Error('onFinish was called, this should not happen.');
            },
            onError: function (message) {
                expect(message).to.equal('OUT_OF_BOUNDS');
                expect(layer.children.length).to.equal(1);
                done();
            },
        });
    });

    it('should give LEAKY_HOLE error if point is inside an open path', function (done) {
        var holeyPath = new paper.Path();
        holeyPath.strokeWidth = 5;
        holeyPath.strokeColor = 'black';
        // Path will look like this:
        // +---------+
        // |         |
        // |           <----- the LEAK
        // |         |
        // +---------+
        holeyPath.add(new paper.Point(100,30));
        holeyPath.add(new paper.Point(100,0));
        holeyPath.add(new paper.Point(0,0));
        holeyPath.add(new paper.Point(0,100));
        holeyPath.add(new paper.Point(100,100));
        holeyPath.add(new paper.Point(100,70));

        var layer = new paper.Layer();
        layer.addChild(holeyPath);
        layer.hole({
            point: new paper.Point(50,50),
            onFinish: function () {
                throw new Error('onFinish was called, this should not happen.');
            },
            onError: function (message) {
                expect(message).to.equal('LEAKY_HOLE');
                expect(layer.children.length).to.equal(1);
                done();
            },
        });
    });

    it('should fill the inside of a closed path', function (done) {
        var closedPath = new paper.Path.Rectangle({
            from: new paper.Point(0, 0),
            to: new paper.Point(100, 100),
            strokeWidth: 5,
            strokeColor: 'black',
        });

        var layer = new paper.Layer();
        layer.addChild(closedPath);
        layer.hole({
            point: new paper.Point(50,50),
            onFinish: function (path) {
                expect(path.bounds.width < 100).to.equal(true);
                expect(path.bounds.height < 100).to.equal(true);
                expect(path.bounds.width > 95).to.equal(true);
                expect(path.bounds.height > 95).to.equal(true);
                expect(layer.children.length).to.equal(1);
                done();
            },
            onError: function (message) {
                throw new Error('onError was called, this should not happen.');
            },
        });
    });
});
