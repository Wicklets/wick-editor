describe('Wick.FileCache', function() {
    it('should add/remove files correctly', function() {
        Wick.FileCache.addFile('foo', 'item1');
        Wick.FileCache.addFile('bar', 'item2');
        Wick.FileCache.addFile('baz', 'item3');
        expect(Wick.FileCache.getFile('item1').src).to.equal('foo');
        expect(Wick.FileCache.getFile('item2').src).to.equal('bar');
        expect(Wick.FileCache.getFile('item3').src).to.equal('baz');

        var allFiles = Wick.FileCache.getAllFiles();
        expect(allFiles.length).to.equal(3);
        expect(allFiles[0].uuid).to.equal('item1');
        expect(allFiles[1].uuid).to.equal('item2');
        expect(allFiles[2].uuid).to.equal('item3');
        expect(allFiles[0].src).to.equal('foo');
        expect(allFiles[1].src).to.equal('bar');
        expect(allFiles[2].src).to.equal('baz');

        Wick.FileCache.clear();
        expect(Wick.FileCache.getAllFiles().length).to.equal(0);
    });
});
