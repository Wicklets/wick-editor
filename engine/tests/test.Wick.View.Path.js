describe('Wick.View.Path', function() {
    describe('#render()', function() {
        it('should render correctly (basic shapes)', function () {

        });
    });
    /*
    describe('#render()', function() {
        it('should render correctly (basic shapes)', function () {
            var path = new Wick.Path(TEST_PATH_DATA);
            expect(path.view.item.fillColor.toCSS(true)).to.equal('#ff0000');
        });

        it('should render correctly (rasters)', function (done) {
            var asset = new Wick.ImageAsset({
                filename: 'test.png',
                src: TEST_IMG_SRC
            });
            var path = new Wick.Path(["Raster",{"applyMatrix":false,"crossOrigin":"","source":"asset","asset":asset.uuid}], [asset]);
            expect(path.view.item.source).to.equal(TEST_IMG_SRC);
            done();
        });
    });

    describe('#importJSON()', function() {
        it('should import correct SVG data', function () {
            var path = new Wick.Path();
            var json = TEST_PATH_DATA;
            path.importJSON(json);
        });

        it('should import correct SVG data (rasters)', function (done) {
            var asset = new Wick.ImageAsset('test.png', TEST_IMG_SRC);
            var path = new Wick.Path();
            path.importJSON(["Raster",{"name":path.uuid,"applyMatrix":false,"crossOrigin":"","source":"asset","asset":asset.uuid}], [asset]);
            expect(path.paperPath.source).to.equal(TEST_IMG_SRC);
            done();
        });
    });

    describe('#exportJSON()', function() {
        it('should export correct SVG data', function () {
            var path = new Wick.Path(TEST_PATH_DATA);
            var json = path.exportJSON();
            expect(JSON.stringify(json)).to.equal(JSON.stringify(TEST_PATH_DATA));
        });

        it('should export correct SVG data (rasters)', function (done) {
            var asset = new Wick.ImageAsset('test.png', TEST_IMG_SRC);
            var path = new Wick.Path(["Raster",{"applyMatrix":false,"crossOrigin":"","source":"asset","asset":asset.uuid}], [asset]);
            var json = path.exportJSON();
            expect(JSON.stringify(json)).to.equal(JSON.stringify(["Raster",{"applyMatrix":false,"data":{"wickUUID":path.uuid,"wickType":"path"},"crossOrigin":"","source":"asset","asset":asset.uuid}]));
            done();
        });
    });
    */
});
