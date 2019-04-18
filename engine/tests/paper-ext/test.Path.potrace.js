describe('Paper.Path.potrace', function() {
    it('should return null for empty path', function (done) {
        var path = new paper.Path();
        path.potrace({
            resolution: 1,
            done: function (res) {
                expect(res).to.equal(null);
                done();
            }
        })
    });

    it('should potrace a simple ellipse', function (done) {
        var path = new paper.Path.Ellipse({
            center: [25, 25],
            radius: [50, 50],
            fillColor: 'black'
        });
        path.potrace({
            resolution: 1,
            done: function (res) {
                expect(res.bounds.width > 95).to.equal(true);
                expect(res.bounds.height > 95).to.equal(true);
                expect(res.bounds.width < 105).to.equal(true);
                expect(res.bounds.height < 105).to.equal(true);
                done();
            },
        })
    });

    it('should potrace complex curvy stroke', function (done) {
        var path = new paper.Path();
        path.strokeColor = 'black';
        path.strokeWidth = 5;

        path.add(new paper.Point(0,0));
        path.add(new paper.Point(0,10));
        path.add(new paper.Point(10,20));
        path.add(new paper.Point(15,50));
        path.add(new paper.Point(60,60));
        path.add(new paper.Point(30,40));
        path.add(new paper.Point(10,15));
        path.add(new paper.Point(25,25));
        path.add(new paper.Point(30,10));
        path.smooth();

        path.potrace({
            resolution: 1,
            done: function (res) {
                expect(res.bounds.width > 60).to.equal(true);
                expect(res.bounds.height > 60).to.equal(true);
                expect(res.bounds.width < 70).to.equal(true);
                expect(res.bounds.height < 70).to.equal(true);
                done();
            },
        })
    });

    it('the same path potraced with a lower resolution should have less segments (less detail)', function (done) {
        var path = new paper.Path.Ellipse({
            center: [25, 25],
            radius: [50, 50],
            fillColor: 'black'
        });

        function potraceHiRes (callback) {
            path.potrace({
                resolution: 1,
                done: function (res) {
                    callback(res);
                },
            });
        }

        function potraceLowRes (callback) {
            path.potrace({
                resolution: 0.5,
                done: function (res) {
                    callback(res);
                },
            });
        }

        potraceLowRes(function (pathLowRes) {
            potraceHiRes(function (pathHiRes) {
                expect(pathLowRes.segments.length < pathHiRes.segments.length).to.equal(true);
                done();
            });
        });
    });
});
