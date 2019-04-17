describe('Wick.View.Selection', function() {
    describe('#render', function () {
        it('should render empty selection without error', function () {
            var project = new Wick.Project();
            project.view.render();

            expect(paper.project.layers[3].id).to.equal(project.selection.view.layer.id);
        });
    });
});
