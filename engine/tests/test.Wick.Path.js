describe('Wick.Path', function() {
    describe('#contructor()', function() {
        it('should instantiate without errors', function () {
            var path = new Wick.Path({json:TestUtils.TEST_PATH_JSON_RED_SQUARE});
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
        it('should serialize correctly', function () {
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
            expect(path.fillColorHex).to.equal('#ff0000');
            path.json = TestUtils.TEST_PATH_JSON_BLUE_SQUARE;
            expect(path.fillColorHex).to.equal('#0000ff');
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

    describe('#fillColorHex', function() {
        it('should return correct hex color', function () {
            var path = new Wick.Path({json:TestUtils.TEST_PATH_JSON_RED_SQUARE});
            expect(path.fillColorHex).to.equal('#ff0000');
        });
    });

    describe('#fillColorRGBA', function() {
        it('should return correct rgba color', function () {
            var path = new Wick.Path({json:TestUtils.TEST_PATH_JSON_RED_SQUARE});
            expect(path.fillColorRGBA.r).to.equal(255);
            expect(path.fillColorRGBA.g).to.equal(0);
            expect(path.fillColorRGBA.b).to.equal(0);
            expect(path.fillColorRGBA.a).to.equal(1);
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
