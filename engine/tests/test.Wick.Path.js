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
            expect(pathFromData.children).to.eql([]);
            expect(pathFromData.identifier).to.equal(null);
            expect(JSON.stringify(pathFromData.json)).to.equal(JSON.stringify(TestUtils.TEST_PATH_JSON_RED_SQUARE));
            expect(pathFromData.uuid).to.equal(pathOriginal.uuid);
        });
    });

    describe('#clone', function() {
        it('should clone correctly', function () {
            var pathOriginal = new Wick.Path({json:TestUtils.TEST_PATH_JSON_RED_SQUARE});
            var pathClone = pathOriginal.clone();

            expect(pathClone instanceof Wick.Path).to.equal(true);
            expect(pathClone.children).to.eql([]);
            expect(pathClone.identifier).to.equal(null);
            expect(JSON.stringify(pathClone.json)).to.equal(JSON.stringify(TestUtils.TEST_PATH_JSON_RED_SQUARE));
            expect(pathClone.uuid).not.to.equal(pathOriginal.uuid);
            expect(pathClone.uuid).not.to.equal(null);
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

    describe('#get classname()', function() {
        it('should return "Path"', function () {
            expect(new Wick.Path({json: TestUtils.TEST_PATH_JSON_RED_SQUARE}).classname).to.equal('Path');
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
