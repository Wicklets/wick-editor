describe('Paper.Selection', function() {
    it('paper.selection should be instantiated automatically', function () {
        paper.project.clear();
        paper.selection = new paper.Selection();
        expect(paper.selection).to.not.equal(undefined);
        expect(paper.selection).to.not.equal(null);
        expect(paper.selection.items.length).to.equal(0);
    });

    it('items should be added and removed correctly', function () {
        paper.project.clear();

        var itemA = new paper.Path();
        var itemB = new paper.Path();
        var itemC = new paper.Path();
        var selection = new paper.Selection({
          items: [itemA, itemB]
        });

        expect(selection.isItemSelected(itemA)).to.equal(true);
        expect(selection.isItemSelected(itemB)).to.equal(true);
        expect(selection.isItemSelected(itemC)).to.equal(false);
        expect(selection.items.length).to.equal(2);
    });

    describe('properties', function () {
        it('properties should be calculated and updated correctly (single path)', function () {

        });

        it('properties should be calculated and updated correctly (multiple paths)', function () {
            paper.project.clear();

            var itemA = new paper.Path.Rectangle({
                from: new paper.Point(0,0),
                to: new paper.Point(50,50),
                fillColor: 'red',
            })
            var itemB = new paper.Path.Rectangle({
                from: new paper.Point(50,0),
                to: new paper.Point(100,50),
                fillColor: 'green',
            })
            var itemC = new paper.Path.Rectangle({
                from: new paper.Point(50,50),
                to: new paper.Point(100,100),
                fillColor: 'blue',
            });

            paper.selection.finish();
            paper.selection = new paper.Selection({
              items: [itemA, itemB, itemC],
            });
            expect(paper.selection.x).to.be.closeTo(0, 0.01);
            expect(paper.selection.y).to.be.closeTo(0, 0.01);
            expect(paper.selection.width).to.be.closeTo(100, 0.01);
            expect(paper.selection.height).to.be.closeTo(100, 0.01);
        });

        it('properties should be calculated and updated correctly (single group)', function () {

        });

        it('properties should be calculated and updated correctly (multiple groups)', function () {

        });
    });

    it('gui items for single object should be created correctly', function () {

    });

    it('gui items for multiple objects should be created correctly', function () {

    });

    it('flip should work correctly', function () {

    });

    describe('ordering', function () {
        it('sendBackwards should work correctly with one object', function () {

        });

        it('sendBackwards should work correctly with multiple objects', function () {

        });

        it('sendToBack should work correctly with one object', function () {

        });

        it('sendToBack should work correctly with multiple objects', function () {

        });

        it('bringForwards should work correctly with one object', function () {

        });

        it('bringForwards should work correctly with multiple objects', function () {

        });

        it('bringToFront should work correctly with one object', function () {

        });

        it('bringToFront should work correctly with multiple objects', function () {

        });
    });

    it('finish() should apply transformations to selected items correctly', function () {

    });
});
