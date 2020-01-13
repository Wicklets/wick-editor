describe('Wick.ObjectCache', function() {
    it('should instantiate correctly and not add additional files on play/pause', function () {
        Wick.ObjectCache.clear();

        var project = new Wick.Project();

        var objectCacheSize = Wick.ObjectCache.getAllObjects().length;

        project.play();
        project.stop();

        var cacheSizeAfterPlayStop = Wick.ObjectCache.getAllObjects().length;

        expect(cacheSizeAfterPlayStop).to.equal(objectCacheSize);
    });

    it('should add/remove files correctly when testing with a simple object', function() {
        Wick.ObjectCache.clear();

        var objectCacheSize = Wick.ObjectCache.getAllObjects().length;

        var dummy = {uuid: "abcdefghijklmnop"}

        Wick.ObjectCache.addObject(dummy);

        var cacheSizeAfterAdd = Wick.ObjectCache.getAllObjects().length;

        expect(cacheSizeAfterAdd).to.equal(objectCacheSize + 1);

        Wick.ObjectCache.removeObject(dummy);
        var cacheSizeAfterRemoval = Wick.ObjectCache.getAllObjects().length;

        expect(cacheSizeAfterRemoval).to.equal(objectCacheSize);
    });

    it('should not create duplicates when deserializing an object from previously cached data', function() {
        Wick.ObjectCache.clear();

        var project = new Wick.Project();
        var path = new Wick.Path({json:TestUtils.TEST_PATH_JSON_RED_SQUARE});
        project.activeFrame.addPath(path);

        var objectCacheSize = Wick.ObjectCache.getAllObjects().length;

        var data = path.serialize();
        var object = Wick.Base.fromData(data);

        var objectCacheSizeAfterSerialization = Wick.ObjectCache.getAllObjects().length;

        expect(objectCacheSizeAfterSerialization).to.equal(objectCacheSize);
    });

    it('should garbage collect correctly', function() {
        Wick.ObjectCache.clear();
    });
});
