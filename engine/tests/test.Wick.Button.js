describe('Wick.Button', function() {
    describe('#constructor', function () {
        it('should instantiate correctly', function() {
            var button = new Wick.Button();
            expect(button.classname).to.equal('Button');
            expect(button.scripts.length).to.equal(1);
            expect(button.getScript('mouseclick').src).to.equal('');
        });
    });

    describe('#tick', function () {
        it('should move playhead based on mouse state (single frame)', function() {
            var project = new Wick.Project();

            var button = new Wick.Button();
            project.activeFrame.addClip(button);
            button.timeline.activeLayer.getFrameAtPlayheadPosition(2).remove();
            button.timeline.activeLayer.getFrameAtPlayheadPosition(3).remove();

            // Nothing happened yet, button is on frame 1.
            button.tick();
            expect(button.timeline.playheadPosition).to.equal(1);

            // Hover the mouse over the button. The button should stay on frame 1.
            project.mouseHoverTargets = [button];
            button.tick();
            expect(button.timeline.playheadPosition).to.equal(1);
            button.tick();
            expect(button.timeline.playheadPosition).to.equal(1);

            // The mouse left the button. The button should stay on frame 1.
            project.mouseHoverTargets = [];
            button.tick();
            expect(button.timeline.playheadPosition).to.equal(1);

            // The mouse hovers back over the button and clicks it. The button should stay on frame 1.
            project.mouseHoverTargets = [button];
            button.tick();
            expect(button.timeline.playheadPosition).to.equal(1);
            project.isMouseDown = true;
            button.tick();
            expect(button.timeline.playheadPosition).to.equal(1);

            // The mouse is no longer down. The button should stay on frame 1.
            project.isMouseDown = false;
            button.tick();
            expect(button.timeline.playheadPosition).to.equal(1);

            // The mouse left the button. The button should stay on frame 1.
            project.mouseHoverTargets = [];
            button.tick();
            expect(button.timeline.playheadPosition).to.equal(1);
        });

        it('should move playhead based on mouse state (two frames)', function() {
            var project = new Wick.Project();

            var button = new Wick.Button();
            project.activeFrame.addClip(button);

            button.timeline.activeLayer.getFrameAtPlayheadPosition(3).remove();

            var frame1 = button.timeline.activeLayer.getFrameAtPlayheadPosition(1);
            var frame2 = button.timeline.activeLayer.getFrameAtPlayheadPosition(2);

            frame1.addPath(TestUtils.paperToWickPath(new paper.Path.Rectangle({
                from: [50, 50],
                to: [100, 100],
                fillColor: 'black'
            })));
            frame2.addPath(TestUtils.paperToWickPath(new paper.Path.Rectangle({
                from: [50, 50],
                to: [100, 100],
                fillColor: 'black'
            })));

            // Nothing happened yet, button is on frame 1.
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(1);

            // Hover the mouse over the button. The button should be on frame 2.
            // (We change the mouseState of the view to simulate mouse events.)
            project.tools.interact.onMouseMove({point:new paper.Point(50,50)});
            project.tools.interact.determineMouseTargets();
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(2);
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(2);

            // The mouse left the button. Tht button goes back to frame 1.
            project.tools.interact.onMouseMove({point:new paper.Point(0,0)});
            project.tools.interact.determineMouseTargets();
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(1);

            // The mouse hovers back over the button and clicks it. The button should go to frame 2.
            project.tools.interact.onMouseMove({point:new paper.Point(50,50)});
            project.tools.interact.determineMouseTargets();
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(2);
            project.tools.interact.onMouseDown({point:new paper.Point(50,50)});
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(2);

            // The mouse is no longer down. The button should go back to frame 2.
            project.tools.interact.onMouseUp({point:new paper.Point(50,50)});
            project.tools.interact.determineMouseTargets();
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(2);

            // The mouse left the button. The button should go back to frame 1.
            project.tools.interact.onMouseMove({point:new paper.Point(0,0)});
            project.tools.interact.determineMouseTargets();
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(1);
        });

        it('should move playhead based on mouse state (three frames)', function() {
            var project = new Wick.Project();

            var button = new Wick.Button();
            project.activeFrame.addClip(button);

            var frame1 = button.timeline.activeLayer.getFrameAtPlayheadPosition(1);
            var frame2 = button.timeline.activeLayer.getFrameAtPlayheadPosition(2);
            var frame3 = button.timeline.activeLayer.getFrameAtPlayheadPosition(3);

            frame1.addPath(TestUtils.paperToWickPath(new paper.Path.Rectangle({
                from: [50, 50],
                to: [100, 100],
                fillColor: 'black'
            })));
            frame2.addPath(TestUtils.paperToWickPath(new paper.Path.Rectangle({
                from: [50, 50],
                to: [100, 100],
                fillColor: 'black'
            })));
            frame3.addPath(TestUtils.paperToWickPath(new paper.Path.Rectangle({
                from: [50, 50],
                to: [100, 100],
                fillColor: 'black'
            })));

            // Nothing happened yet, button is on frame 1.
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(1);

            // Hover the mouse over the button. The button should be on frame 2.
            project.tools.interact.onMouseMove({point: new paper.Point(50,50)});
            project.tools.interact.determineMouseTargets();
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(2);
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(2);

            // The mouse left the button. Tht button goes back to frame 1.
            project.tools.interact.onMouseMove({point:new paper.Point(0,0)});
            project.tools.interact.determineMouseTargets();
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(1);

            // The mouse hovers back over the button and clicks it. The button should go to frame 2, and then frame 3.
            project.tools.interact.onMouseMove({point:new paper.Point(50,50)});
            project.tools.interact.determineMouseTargets();
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(2);
            project.tools.interact.onMouseMove({point:new paper.Point(50,50)});
            project.tools.interact.onMouseDown({point:new paper.Point(50,50)});
            project.tools.interact.determineMouseTargets();
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(3);

            // The mouse is no longer down. The button should go back to frame 2.
            project.tools.interact.onMouseUp({point:new paper.Point(50,50)});
            project.tools.interact.determineMouseTargets();
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(2);

            // The mouse left the button. The button should go back to frame 1.
            project.tools.interact.onMouseMove({point:new paper.Point(0,0)});
            project.tools.interact.determineMouseTargets();
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(1);
        });

        it('should run correct scripts on frames inside button', function() {
            var project = new Wick.Project();

            var button = new Wick.Button();
            var frame1 = button.activeFrame;
            var frame2 = new Wick.Frame({start:2});
            var frame3 = new Wick.Frame({start:3});
            button.activeLayer.addFrame(frame2);
            button.activeLayer.addFrame(frame3);
            project.activeFrame.addClip(button);

            frame1.addPath(TestUtils.paperToWickPath(new paper.Path.Rectangle({
                from: [50, 50],
                to: [100, 100],
                fillColor: 'black'
            })));
            frame2.addPath(TestUtils.paperToWickPath(new paper.Path.Rectangle({
                from: [50, 50],
                to: [100, 100],
                fillColor: 'black'
            })));
            frame3.addPath(TestUtils.paperToWickPath(new paper.Path.Rectangle({
                from: [50, 50],
                to: [100, 100],
                fillColor: 'black'
            })));

            frame1.addScript('load', 'this.__frame1ScriptRan = true;');
            frame2.addScript('load', 'this.__frame2ScriptRan = true;');
            frame3.addScript('load', 'this.__frame3ScriptRan = true;');

            project.tools.interact.onMouseMove({point: new paper.Point(0,0)});
            project.tools.interact.determineMouseTargets();
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(1);
            expect(frame1.parentClip.__frame1ScriptRan).to.equal(true);
            expect(frame2.parentClip.__frame2ScriptRan).to.equal(undefined);
            expect(frame3.parentClip.__frame3ScriptRan).to.equal(undefined);

            project.tools.interact.onMouseMove({point: new paper.Point(50,50)});
            project.tools.interact.determineMouseTargets();
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(2);
            expect(frame2.parentClip.__frame2ScriptRan).to.equal(true);
            expect(frame3.parentClip.__frame3ScriptRan).to.equal(undefined);

            project.tools.interact.onMouseDown({point:new paper.Point(50,50)});
            project.tools.interact.determineMouseTargets();
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(3);
            expect(frame3.parentClip.__frame3ScriptRan).to.equal(true);
        });
    });
});
