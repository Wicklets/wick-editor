describe('Wick.Color', function() {
    describe('#constructor', function () {
        it('should instantiate correctly', function() {
            var color = new Wick.Color();
        });

        it('should instantiate correctly with hex color string', function() {
            var color = new Wick.Color('#ff0000');
            expect(color.r).to.equal(1);
            expect(color.g).to.equal(0);
            expect(color.b).to.equal(0);
        });

        it('should instantiate correctly with rgba color string', function() {
            var color = new Wick.Color('rgba(255,0,0,0.5)');
            expect(color.r).to.equal(1);
            expect(color.g).to.equal(0);
            expect(color.b).to.equal(0);
            expect(color.a).to.equal(0.5);
        });

        it('should instantiate correctly with named color string', function() {
            var color = new Wick.Color('red');
            expect(color.r).to.equal(1);
            expect(color.g).to.equal(0);
            expect(color.b).to.equal(0);
        });
    });

    describe('#r,g,b,a', function () {
        it('should return the red, greed, blue, and  alpha values of the color', function() {
            var color = new Wick.Color('#ff0000');
            expect(color.r).to.equal(1);
            expect(color.g).to.equal(0);
            expect(color.b).to.equal(0);
        });
    });

    describe('#hex', function () {
        it('should return the hex string of the color', function() {
            var color = new Wick.Color('#ff0000');
            expect(color.hex).to.equal('#ff0000');
        });
    });

    describe('#rgba', function () {
        it('should return the rgba string of the color', function() {
            var color = new Wick.Color('#ff0000');
            expect(color.rgba).to.equal('rgb(255,0,0)');
        });

        it('should return the rgba string of the color (with alpha)', function() {
            var color = new Wick.Color('rgba(255, 155, 0, 0.5)');
            expect(color.rgba).to.equal('rgba(255,155,0,0.5)');
        });
    });
});
