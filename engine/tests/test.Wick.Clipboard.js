describe('Wick.Clipboard', function() {
    it('should copy and paste objects correctly', function () {
        var project = new Wick.Project();

        var path1 = new Wick.Path({json: TestUtils.TEST_PATH_JSON_RED_SQUARE});
        var path2 = new Wick.Path({json: TestUtils.TEST_PATH_JSON_BLUE_CIRCLE});

        project.activeFrame.addPath(path1);
        project.activeFrame.addPath(path2);

        
    });
});
