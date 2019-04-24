describe('Wick.Path', function() {
    var TEST_IMG_SRC = 'data:image/png;base64,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';

    var TEST_PATH_JSON_RED_SQUARE = [
        "Path",
        {
            "name":"9ff5f1f2-afeb-4380-88da-5fda3bb6e906",
            "applyMatrix":true,
            "data":{
                "wickUUID":"9ff5f1f2-afeb-4380-88da-5fda3bb6e906",
                "wickType":"path"
            },
            "segments":[
                [0,50],
                [0,0],
                [50,0],
                [50,50]
            ],
            "closed":true,
            "fillColor":[1,0,0]
        }
    ];
    var TEST_PATH_JSON_BLUE_SQUARE = [
        "Path",
        {
            "name":"9ff5f1f2-afeb-4380-88da-5fda3bb6e906",
            "applyMatrix":true,
            "data":{
                "wickUUID":"9ff5f1f2-afeb-4380-88da-5fda3bb6e906",
                "wickType":"path"
            },
            "segments":[
                [0,50],
                [0,0],
                [50,0],
                [50,50]
            ],
            "closed":true,
            "fillColor":[0,0,1]
        }
    ];

    describe('#contructor()', function() {
        it('should instantiate without errors', function () {
            var path = new Wick.Path({json:TEST_PATH_JSON_RED_SQUARE});
        });

        it('should instantiate without errors (rasters)', function (done) {
            var asset = new Wick.ImageAsset({
                filename: 'test.png',
                src: TEST_IMG_SRC
            });
            var path = new Wick.Path({asset: asset});
            path.onLoad = (e) => {
                expect(path.bounds.top).to.equal(-50);
                expect(path.bounds.bottom).to.equal(50);
                expect(path.bounds.left).to.equal(-50);
                expect(path.bounds.right).to.equal(50);
                done();
            }
        });
    });

    describe('#json', function() {
        it('should update json without errors', function () {
            var path = new Wick.Path({json:TEST_PATH_JSON_RED_SQUARE});
            expect(path.fillColorHex).to.equal('#ff0000');
            path.json = TEST_PATH_JSON_BLUE_SQUARE;
            expect(path.fillColorHex).to.equal('#0000ff');
        });
    });

    describe('#bounds', function() {
        it('should return correct bounds', function () {
            var path = new Wick.Path({json:TEST_PATH_JSON_RED_SQUARE});
            expect(path.bounds.top).to.equal(0);
            expect(path.bounds.bottom).to.equal(50);
            expect(path.bounds.left).to.equal(0);
            expect(path.bounds.right).to.equal(50);
        });
    });

    describe('#fillColorHex', function() {
        it('should return correct hex color', function () {
            var path = new Wick.Path({json:TEST_PATH_JSON_RED_SQUARE});
            expect(path.fillColorHex).to.equal('#ff0000');
        });
    });

    describe('#fillColorRGBA', function() {
        it('should return correct rgba color', function () {
            var path = new Wick.Path({json:TEST_PATH_JSON_RED_SQUARE});
            expect(path.fillColorRGBA.r).to.equal(255);
            expect(path.fillColorRGBA.g).to.equal(0);
            expect(path.fillColorRGBA.b).to.equal(0);
            expect(path.fillColorRGBA.a).to.equal(1);
        });
    });

/*
    describe('#serialize()', function() {
        it('should serialize correctly', function () {
            var path = new Wick.Path(TEST_PATH_DATA);
            var data = path.serialize();
            expect(data.classname).to.equal(path.classname);
            expect(JSON.stringify(data.pathJSON)).to.equal(JSON.stringify(TEST_PATH_DATA));
        });
    });

    describe('#clone()', function() {
        it('should clone correctly', function () {
            var path = new Wick.Path(TEST_PATH_DATA);
            var clone = path.clone();

            // successful clone?
            expect(path).to.not.equal(clone);

            // uuids regenerated?
            expect(path.uuid).not.to.equal(clone.uuid);
            expect(path.paperPath.data.wickUUID).not.to.equal(clone.paperPath.data.wickUUID);

            // uuid updated for both paper path and wick path?
            expect(clone.paperPath.data.wickUUID).to.equal(clone.uuid);
        });

        it('should clone correctly (retainUUIDs=true)', function () {
            var path = new Wick.Path(TEST_PATH_DATA);
            var clone = path.clone(true);

            // successful clone?
            expect(path).to.not.equal(clone);

            // uuids unchanged?
            expect(path.uuid).to.equal(clone.uuid);
            expect(path.paperPath.data.wickUUID).to.equal(clone.paperPath.data.wickUUID);

            // uuid updated for both paper path and wick path?
            expect(clone.paperPath.data.wickUUID).to.equal(clone.uuid);
        });
    });

    describe('#deserialize()', function() {
        it('should load serialized data', function () {
            var data = {
                classname: 'Path',
                pathJSON: TEST_PATH_DATA,
            };
            var path = Wick.Path.deserialize(data);
            expect(path instanceof Wick.Path).to.equal(true);
            expect(JSON.stringify(path.exportJSON())).to.equal(JSON.stringify(data.pathJSON));
        });
    });
*/

    describe('#get classname()', function() {
        it('should return "Path"', function () {
            expect(new Wick.Path().classname).to.equal('Path');
        });
    });

    describe('#remove()', function() {
        it('should remove path from parent frame', function () {
            var frame = new Wick.Frame();
            var path = new Wick.Path();
            frame.addPath(path);
            path.remove();
            expect(frame.paths.length).to.equal(0);
        });
    });
});
