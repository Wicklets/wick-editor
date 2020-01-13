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

        Wick.FileCache.removeFile('item1');
        var allFilesWithOneMissing = Wick.FileCache.getAllFiles();
        expect(allFilesWithOneMissing.length).to.equal(2);
        expect(allFilesWithOneMissing[0].uuid).to.equal('item2');
        expect(allFilesWithOneMissing[1].uuid).to.equal('item3');
        expect(allFilesWithOneMissing[0].src).to.equal('bar');
        expect(allFilesWithOneMissing[1].src).to.equal('baz');

        Wick.FileCache.clear();
        expect(Wick.FileCache.getAllFiles().length).to.equal(0);

        Wick.FileCache.removeFile('foo');
        expect(Wick.FileCache.getAllFiles().length).to.equal(0);
    });

    it('should have the correct prefix for saved files', function() {
      expect(Wick.FileCache.FILE_LOCALFORAGE_KEY_PREFIX).to.equal('filesrc_');
    });
});
