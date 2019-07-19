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

    describe('#serialize()', function() {
        it('should serialize image path and save asset UUID', function (done) {
            var project = new Wick.Project();

            var imageAsset = new Wick.ImageAsset({
                filename: 'foo.png',
                src: TestUtils.TEST_IMG_SRC_PNG,
            });
            project.addAsset(imageAsset);

            Wick.Path.createImagePath(imageAsset, path => {
                project.activeFrame.addPath(path);
                var data = path.serialize();
                expect(data.json[1].source).to.equal('asset:'+imageAsset.uuid);
                done();
            });
        });
    });

    describe('#createImagePathSync', function () {
        it('should create image path without errors', function () {
            var project = new Wick.Project();

            var imageAsset = new Wick.ImageAsset({
                filename: 'foo.png',
                src: TestUtils.TEST_IMG_SRC_PNG,
            });
            project.addAsset(imageAsset);

            var path = Wick.Path.createImagePathSync(imageAsset);

            // dataURL, if path does not belong to a project
            // (this test should work, but it logs an error, so it's disabled)
            // expect(path.serialize().json[1].source).to.equal(imageAsset.src);

            // asset:uuid, if path belongs to a project, and an asset with that source exists.
            project.activeFrame.addPath(path);
            expect(path.serialize().json[1].source).to.equal('asset:' + imageAsset.uuid);
        });
    })

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
            }));
            path.fontWeight = 400;
            expect(path.fontFamily).to.equal('Helvetica');
            expect(path.fontSize).to.equal(16);
            expect(path.fontWeight).to.equal(400);
            path.fontFamily = 'Arial';
            path.fontSize = 12;
            path.fontWeight = 900;
            path.fontStyle = 'italic';
            path.view.render();
            expect(path.view.item.fontFamily).to.equal('Arial');
            expect(path.view.item.fontSize).to.equal(12);
            expect(path.view.item.fontWeight).to.equal('900 italic');
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

    describe('#pathType', function() {
        it('should return correct pathType', function (done) {
            var project = new Wick.Project();

            var imageAsset = new Wick.ImageAsset({
                filename: 'foo.png',
                src: TestUtils.TEST_IMG_SRC_PNG,
            });
            project.addAsset(imageAsset);

            Wick.Path.createImagePath(imageAsset, imageReult => {
                var path = TestUtils.paperToWickPath(new paper.Path.Rectangle({
                    fillColor: 'red',
                    to: new paper.Point(0,0),
                    from: new paper.Point(100,100),
                }));
                var text = TestUtils.paperToWickPath(new paper.PointText({
                    content: 'foo'
                }));
                var image = imageReult;

                expect(path.pathType).to.equal('path');
                expect(text.pathType).to.equal('text');
                expect(image.pathType).to.equal('image');

                done();
            });
        });
    });

    describe('#isDynamicText', function() {
        it('should be true if path is dynamic text', function () {
            var text = TestUtils.paperToWickPath(new paper.PointText({
                content: 'foo'
            }));

            var dynamicText = TestUtils.paperToWickPath(new paper.PointText({
                content: 'foo'
            }));
            dynamicText.identifier = 'dynamictext';

            expect(text.isDynamicText).to.equal(false);
            expect(dynamicText.isDynamicText).to.equal(true);
        });
    });

    describe('backwards compatability', function() {
        it('should support old raster path formats', function (done) {
            var project = new Wick.Project();
            var imageAsset = new Wick.ImageAsset({
                filename: 'foo.png',
                src: TestUtils.TEST_IMG_SRC_PNG,
            });
            project.addAsset(imageAsset);

            // try to get paper.js to cache the image...
            imageAsset.createInstance(() => {
                // The current format stores the asset UUID as such:
                var currentImageFormat = new Wick.Path();
                currentImageFormat._json = [
                  "Raster",
                  {
                    "applyMatrix": false,
                    "matrix": [
                      1,
                      0,
                      0,
                      1,
                      100,
                      200
                    ],
                    "crossOrigin": "",
                    "source": 'asset:' + imageAsset.uuid,
                  }
                ];
                project.activeFrame.addPath(currentImageFormat);

                // The old format stores the asset UUID slightly differently.
                var oldImageFormat = new Wick.Path();
                oldImageFormat._json = [
                  "Raster",
                  {
                    "applyMatrix": false,
                    "data": {
                      "asset": imageAsset.uuid
                    },
                    "matrix": [
                      1,
                      0,
                      0,
                      1,
                      300,
                      200
                    ],
                    "crossOrigin": "",
                    "source": "asset"
                  }
                ];
                project.activeFrame.addPath(oldImageFormat);

                // The old format, in a slightly different way (some projects have this for some reason)
                var oldImageFormat2 = new Wick.Path();
                oldImageFormat2._json = [
                  "Raster",
                  {
                    "applyMatrix": false,
                    "matrix": [
                      1,
                      0,
                      0,
                      1,
                      300,
                      200
                    ],
                    "crossOrigin": "",
                    "asset": imageAsset.uuid,
                    "source": "asset"
                  }
                ];
                project.activeFrame.addPath(oldImageFormat2);

                // Bug: Image paths sometimes store the actual image source. This is very bad for the filesize.
                var buggedImageFormat = new Wick.Path();
                buggedImageFormat._json = [
                  "Raster",
                  {
                    "applyMatrix": false,
                    "matrix": [
                      1,
                      0,
                      0,
                      1,
                      500,
                      200
                    ],
                    "crossOrigin": "",
                    "source": imageAsset.src,
                  }
                ];
                project.activeFrame.addPath(buggedImageFormat);

                project.view.render();

                expect(currentImageFormat.view.item.bounds.width).to.equal(100);
                expect(currentImageFormat.view.item.bounds.height).to.equal(100);
                expect(oldImageFormat.view.item.bounds.width).to.equal(100);
                expect(oldImageFormat.view.item.bounds.height).to.equal(100);
                expect(oldImageFormat2.view.item.bounds.width).to.equal(100);
                expect(oldImageFormat2.view.item.bounds.height).to.equal(100);
                expect(buggedImageFormat.view.item.bounds.width).to.equal(100);
                expect(buggedImageFormat.view.item.bounds.height).to.equal(100);

                done();
            });
        });
    });

    describe('#unite', function() {
        it('should unite two fills', function () {
            var fill1 = TestUtils.paperToWickPath(new paper.Path.Rectangle({
                from: [0, 0],
                to: [50, 50],
                fillColor: '#ff0000',
                strokeColor: '#000000',
                strokeWidth: 5,
            }));
            var fill2 = TestUtils.paperToWickPath(new paper.Path.Rectangle({
                from: [25, 25],
                to: [75, 75],
                fillColor: '#00ff00',
            }));

            var united = Wick.Path.unite([fill1, fill2]);

            expect(united.fillColor.toCSS(true)).to.equal('#ff0000');
            expect(united.strokeColor.toCSS(true)).to.equal('#000000');
            expect(united.strokeWidth).to.equal(5);
            expect(united.bounds.width).to.equal(75);
            expect(united.bounds.height).to.equal(75);
        });
    });

    describe('#subtract', function() {
        it('should subtract two fills', function () {
            var fill1 = TestUtils.paperToWickPath(new paper.Path.Rectangle({
                from: [0, 0],
                to: [50, 50],
                fillColor: '#ff0000',
                strokeColor: '#000000',
                strokeWidth: 5,
            }));
            var fill2 = TestUtils.paperToWickPath(new paper.Path.Rectangle({
                from: [25, 25],
                to: [75, 75],
                fillColor: '#00ff00',
            }));

            var united = Wick.Path.subtract([fill1, fill2]);

            expect(united.fillColor.toCSS(true)).to.equal('#ff0000');
            expect(united.strokeColor.toCSS(true)).to.equal('#000000');
            expect(united.strokeWidth).to.equal(5);
            expect(united.bounds.width).to.equal(50);
            expect(united.bounds.height).to.equal(50);
        });
    });

    describe('#intersect', function() {
        it('should intersect two fills', function () {
            var fill1 = TestUtils.paperToWickPath(new paper.Path.Rectangle({
                from: [0, 0],
                to: [50, 50],
                fillColor: '#ff0000',
                strokeColor: '#000000',
                strokeWidth: 5,
            }));
            var fill2 = TestUtils.paperToWickPath(new paper.Path.Rectangle({
                from: [25, 25],
                to: [75, 75],
                fillColor: '#00ff00',
            }));

            var united = Wick.Path.intersect([fill1, fill2]);

            expect(united.fillColor.toCSS(true)).to.equal('#ff0000');
            expect(united.strokeColor.toCSS(true)).to.equal('#000000');
            expect(united.strokeWidth).to.equal(5);
            expect(united.bounds.width).to.equal(25);
            expect(united.bounds.height).to.equal(25);
        });
    });
});
