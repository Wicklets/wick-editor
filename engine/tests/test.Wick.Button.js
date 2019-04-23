describe('Wick.Button', function() {
    describe('#constructor', function () {
        it('should instantiate correctly', function() {
            var button = new Wick.Button();
            expect(button.classname).to.equal('Button');
        });
    });
/*
    describe('#serialize', function () {
        it('should serialize correctly', function() {
            var button = new Wick.Button();
            var data = button.serialize();
            expect(data.classname).to.equal('Button');
        });
    });

    describe('#_deserialize', function () {
        it('should deserialize correctly', function() {
            var data = {
                classname: 'Button',
                timeline: new Wick.Timeline().serialize(),
                scripts: [],
                transform: new Wick.Transformation().serialize(),
            };

            var button = Wick.Button.deserialize(data);
            expect(button instanceof Wick.Button).to.equal(true);
        });
    });
*/
    describe('#tick', function () {
        it('should move playhead based on mouse state (single frame)', function() {
            var project = new Wick.Project();

            var button = new Wick.Button();
            project.activeFrame.addClip(button);
            button.timeline.addLayer(new Wick.Layer());
            button.activeLayer.addFrame(new Wick.Frame({start:1}));

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
            button.timeline.addLayer(new Wick.Layer());
            button.activeLayer.addFrame(new Wick.Frame({start:1}));
            button.activeLayer.addFrame(new Wick.Frame({start:2}));

            // Nothing happened yet, button is on frame 1.
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(1);

            // Hover the mouse over the button. The button should be on frame 2.
            // (We change the mouseState of the view to simulate mouse events.)
            button.view._mouseState = 'over';
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(2);
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(2);

            // The mouse left the button. Tht button goes back to frame 1.
            button.view._mouseState = 'out';
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(1);

            // The mouse hovers back over the button and clicks it. The button should go to frame 2.
            button.view._mouseState = 'over';
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(2);
            button.view._mouseState = 'down';
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(2);

            // The mouse is no longer down. The button should go back to frame 2.
            button.view._mouseState = 'over';
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(2);

            // The mouse left the button. The button should go back to frame 1.
            button.view._mouseState = 'out';
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(1);
        });

        it('should move playhead based on mouse state (three frames)', function() {
            var project = new Wick.Project();

            var button = new Wick.Button();
            project.activeFrame.addClip(button);
            button.timeline.addLayer(new Wick.Layer());
            button.activeLayer.addFrame(new Wick.Frame({start:1}));
            button.activeLayer.addFrame(new Wick.Frame({start:2}));
            button.activeLayer.addFrame(new Wick.Frame({start:3}));

            // Nothing happened yet, button is on frame 1.
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(1);

            // Hover the mouse over the button. The button should be on frame 2.
            button.view._mouseState = 'over';
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(2);
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(2);

            // The mouse left the button. Tht button goes back to frame 1.
            button.view._mouseState = 'out';
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(1);

            // The mouse hovers back over the button and clicks it. The button should go to frame 2, and then frame 3.
            button.view._mouseState = 'over';
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(2);
            button.view._mouseState = 'down';
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(3);

            // The mouse is no longer down. The button should go back to frame 2.
            button.view._mouseState = 'over';
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(2);

            // The mouse left the button. The button should go back to frame 1.
            button.view._mouseState = 'out';
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

            frame1.addScript('load', 'this.__frame1ScriptRan = true;');
            frame2.addScript('load', 'this.__frame2ScriptRan = true;');
            frame3.addScript('load', 'this.__frame3ScriptRan = true;');

            button.view._mouseState = 'out';
            project.tick();
            expect(button.timeline.playheadPosition).to.equal(1);
            expect(frame1.__frame1ScriptRan).to.equal(true);
            expect(frame2.__frame2ScriptRan).to.equal(undefined);
            expect(frame3.__frame3ScriptRan).to.equal(undefined);

            button.view._mouseState = 'over';
            project.tick();
            //project.tick();
            expect(button.timeline.playheadPosition).to.equal(2);
            expect(frame2.__frame2ScriptRan).to.equal(true);
            expect(frame3.__frame3ScriptRan).to.equal(undefined);

            button.view._mouseState = 'down';
            project.tick();
            //project.tick();
            expect(button.timeline.playheadPosition).to.equal(3);
            expect(frame3.__frame3ScriptRan).to.equal(true);
        });
    });
});
