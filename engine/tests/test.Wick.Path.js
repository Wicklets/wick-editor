describe('Wick.Path', function() {
    describe('#contructor()', function() {
        it('should instantiate without errors', function () {
            var path = new Wick.Path({json:TestUtils.TEST_PATH_JSON_RED_SQUARE});
        });
    });

    describe('#createImagePath()', function() {
        it('should create image path without errors', function (done) {
            var project = new Wick.Project();

            var imageAsset = new Wick.ImageAsset({
                filename: 'foo.png',
                src: TestUtils.TEST_IMG_SRC_PNG,
            });
            project.addAsset(imageAsset);

            Wick.Path.createImagePath(imageAsset, path => {
                expect(path.view.item.bounds.width).to.equal(100);
                done();
            });
        });
    });

    describe('#serialize', function() {
        it('should serialize correctly', function () {
            var path = new Wick.Path({json:TestUtils.TEST_PATH_JSON_RED_SQUARE});
            var data = path.serialize();

            expect(data.children).to.eql([]);
            expect(data.classname).to.equal('Path');
            expect(data.identifier).to.equal(null);
            expect(JSON.stringify(data.json)).to.equal(JSON.stringify(TestUtils.TEST_PATH_JSON_RED_SQUARE));
            expect(data.uuid).to.equal(path.uuid);
        });
    });

    describe('#deserialize', function() {
        it('should deserialize correctly', function () {
            var pathOriginal = new Wick.Path({json:TestUtils.TEST_PATH_JSON_RED_SQUARE});
            var data = pathOriginal.serialize();
            var pathFromData = Wick.Path.fromData(data);

            expect(pathFromData instanceof Wick.Path).to.equal(true);
            expect(pathFromData.getChildren()).to.eql([]);
            expect(pathFromData.identifier).to.equal(null);
            expect(JSON.stringify(pathFromData.json)).to.equal(JSON.stringify(TestUtils.TEST_PATH_JSON_RED_SQUARE));
            expect(pathFromData.uuid).to.equal(pathOriginal.uuid);
        });
    });

    describe('#copy', function() {
        it('should copy correctly', function () {
            var pathOriginal = new Wick.Path({json:TestUtils.TEST_PATH_JSON_RED_SQUARE});
            var pathcopy = pathOriginal.copy();

            expect(pathcopy instanceof Wick.Path).to.equal(true);
            expect(pathcopy.getChildren()).to.eql([]);
            expect(pathcopy.identifier).to.equal(null);
            expect(JSON.stringify(pathcopy.json)).to.equal(JSON.stringify(TestUtils.TEST_PATH_JSON_RED_SQUARE));
            expect(pathcopy.uuid).not.to.equal(pathOriginal.uuid);
            expect(pathcopy.uuid).not.to.equal(null);
        });
    });

    describe('#json', function() {
        it('should update json without errors', function () {
            var path = new Wick.Path({json:TestUtils.TEST_PATH_JSON_RED_SQUARE});
            expect(path.fillColor.toCSS(true)).to.equal('#ff0000');
            path.json = TestUtils.TEST_PATH_JSON_BLUE_SQUARE;
            expect(path.fillColor.toCSS(true)).to.equal('#0000ff');
        });
    });

    describe('#bounds', function() {
        it('should return correct bounds', function () {
            var path = new Wick.Path({json:TestUtils.TEST_PATH_JSON_RED_SQUARE});
            expect(path.bounds.top).to.equal(0);
            expect(path.bounds.bottom).to.equal(50);
            expect(path.bounds.left).to.equal(0);
            expect(path.bounds.right).to.equal(50);
        });
    });

    describe('#x,y', function() {
        it('should update x without errors', function () {
            var path = new Wick.Path({json:TestUtils.TEST_PATH_JSON_RED_SQUARE});
            expect(path.x).to.equal(25);
            path.x = 50;
            expect(path.x).to.equal(50);
        });

        it('should update y without errors', function () {
            var path = new Wick.Path({json:TestUtils.TEST_PATH_JSON_RED_SQUARE});
            expect(path.y).to.equal(25);
            path.y = 50;
            expect(path.y).to.equal(50);
        });
    })

    describe('#fillColor', function() {
        it('should return correct fill color', function () {
            var path = new Wick.Path({json:TestUtils.TEST_PATH_JSON_RED_SQUARE});
            expect(path.fillColor.toCSS(true)).to.equal('#ff0000');
        });
    });

    describe('#strokeColor', function() {
        it('should return correct stroke color', function () {
            var path = TestUtils.paperToWickPath(new paper.Path.Rectangle({
                strokeColor: '#00ff00',
                from: new paper.Point(0,0),
                to: new paper.Point(50,50),
            }));
            expect(path.strokeColor.toCSS(true)).to.equal('#00ff00');
        });
    });

    describe('#fontFamily,fontSize,fontWeight', function() {
        it('should return correct fontFamily/fontSize/fontWeight', function () {
            var path = TestUtils.paperToWickPath(new paper.PointText({
                fillColor: '#000000',
                fontFamily: 'Helvetica',
                fontSize: 16,
                fontWeight: 'bold',
            }));
            expect(path.fontFamily).to.equal('Helvetica');
            expect(path.fontSize).to.equal(16);
            expect(path.fontWeight).to.equal('bold');
            path.fontFamily = 'Arial';
            path.fontSize = 12;
            path.fontWeight = 'bold';
            expect(path.view.item.fontFamily).to.equal('Arial');
            expect(path.view.item.fontSize).to.equal(12);
            expect(path.view.item.fontWeight).to.equal('bold');
        });

        it('fontWeight should always return a string', function () {
            var path = TestUtils.paperToWickPath(new paper.PointText({
                fillColor: '#000000',
                fontFamily: 'Helvetica',
                fontSize: 16,
            }));
            path.fontWeight = 'normal';
            expect(path.fontWeight).to.equal('normal');
            path.fontWeight = 'bold';
            expect(path.fontWeight).to.equal('bold');
            path.fontWeight = 'black';
            expect(path.fontWeight).to.equal('black');
            path.fontWeight = 400;
            expect(path.fontWeight).to.equal('normal');
            path.fontWeight = 100;
            expect(path.fontWeight).to.equal('thin');
            path.fontWeight = 900;
            expect(path.fontWeight).to.equal('black');
        });
    });

    describe('#remove()', function() {
        it('should remove path from parent frame', function () {
            var frame = new Wick.Frame();
            var path = new Wick.Path({json: TestUtils.TEST_PATH_JSON_RED_SQUARE});
            frame.addPath(path);
            path.remove();
            expect(frame.paths.length).to.equal(0);
        });
    });
});
