describe('Wick.SVGAsset', function() {
    describe('#constructor', function() {
        it('should instantiate correctly', function() {
            /*var asset = new Wick.ClipAsset({
                filename: 'object.wickobj',
                src: TestUtils.TEST_WICKOBJ_SRC,
            });

            expect(asset instanceof Wick.ClipAsset).to.equal(true);*/
        });
    });

    describe('#walkItems', function() {
        it('should retrurn the Wick equlalant of the objects created in paper', function() {
            var asset = new Wick.SVGAsset();

            var myPath = new paper.Path();
            myPath.strokeColor = 'black';
            myPath.add(new paper.Point(0, 0));
            myPath.add(new paper.Point(100, 50));
            var anItem = asset.walkItems(myPath);
            //TODO check that anItem has been converted correctly

            var myLayer = new paper.Layer();
            var secondPath = new paper.Path.Circle(new paper.Point(150, 50), 35);
            secondPath.fillColor = 'green';
            var aLayer = asset.walkItems(myLayer);
            //TODO check that aLayer has been converted correctly


            // Create two circle shaped paths:
            var firstPath = new paper.Path.Circle(new paper.Point(80, 50), 35);
            var secondPath = new paper.Path.Circle(new paper.Point(120, 50), 35);
            var group = new paper.Group([firstPath, secondPath]);
            // Change the fill color of the items contained within the group:
            group.style = {
                fillColor: 'red',
                strokeColor: 'black'
            };
            var agroup = asset.walkItems(group);
            //TODO check that agroup has been converted correctly
            //var assetInstance = new Wick.ClipAsset.createInstance();
            /*var asset = new Wick.ClipAsset({
                filename: 'object.wickobj',
                src: TestUtils.TEST_WICKOBJ_SRC,
            });

            expect(asset instanceof Wick.ClipAsset).to.equal(true);*/
        });
    });





    describe('#createInstance', function() {
        it('should create an instance of the SVG correctly', function(done) {
            /*var project = new Wick.Project();
            var asset = new Wick.ClipAsset({
                filename: 'object.wickobj',
                src: TestUtils.TEST_WICKOBJ_SRC,
            });
            project.addAsset(asset);

            asset.createInstance(instance => {
                expect(instance instanceof Wick.Clip).to.equal(true);
                done();
            }, project);*/
        });
    });
});