describe('Wick.GUIElement.Project', function() {
    it('should render frames correctly', function () {
        var project = new Wick.Project();
        project.activeLayer.addFrame(new Wick.Frame(2));
        project.activeLayer.addFrame(new Wick.Frame(3));

        project.guiElement.build();
        //console.log(paper);
    });
});
