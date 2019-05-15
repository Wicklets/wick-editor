describe('Wick.Tickable', function() {
    describe('#constructor', function () {
        it('should instantiate', function() {
            var tickable = new Wick.Tickable();
            expect(tickable instanceof Wick.Base).to.equal(true);
            expect(tickable instanceof Wick.Tickable).to.equal(true);
            expect(tickable.classname).to.equal('Tickable');
            expect(tickable.identifier).to.equal(null);
        });
    });

    describe('#scripts', function () {

    });

    describe('#onScreen', function () {

    });

    describe('#addScript', function () {
        it('should add scripts', function () {
            var tickable = new Wick.Tickable();

            tickable.addScript('load', 'foo()');
            expect(tickable.scripts.length).to.equal(1);
            expect(tickable.scripts[0].name).to.equal('load');
            expect(tickable.scripts[0].src).to.equal('foo()');

            tickable.addScript('update', 'bar()');
            expect(tickable.scripts.length).to.equal(2);
            expect(tickable.scripts[0].name).to.equal('load');
            expect(tickable.scripts[0].src).to.equal('foo()');
            expect(tickable.scripts[1].name).to.equal('update');
            expect(tickable.scripts[1].src).to.equal('bar()');
        });

        it('should add scripts, and they should be in order', function () {
            var tickable = new Wick.Tickable();

            tickable.addScript('unload', 'unload_foo()');
            tickable.addScript('update', 'update_foo()');
            tickable.addScript('mouseenter', 'mouseenter_foo()');
            tickable.addScript('load', 'load_foo()');

            expect(tickable.scripts.length).to.equal(4);
            expect(tickable.scripts[0].name).to.equal('load');
            expect(tickable.scripts[0].src).to.equal('load_foo()');
            expect(tickable.scripts[1].name).to.equal('update');
            expect(tickable.scripts[1].src).to.equal('update_foo()');
            expect(tickable.scripts[2].name).to.equal('unload');
            expect(tickable.scripts[2].src).to.equal('unload_foo()');
            expect(tickable.scripts[3].name).to.equal('mouseenter');
            expect(tickable.scripts[3].src).to.equal('mouseenter_foo()');
        });
    });

    describe('#getScript', function () {

    });

    describe('#getAvailableScripts', function () {

    });

    describe('#hasScript', function () {

    });

    describe('#updateScript', function () {

    });

    describe('#removeScript', function () {

    });

    describe('#runScript', function () {

    });

    describe('#tick', function () {
        it('should tick based on onScreen correctly', function() {
            var tickable = new Wick.Tickable();
            tickable.addScript('load', 'this.tickState = "load";');
            tickable.addScript('update', 'this.tickState = "update";');
            tickable.addScript('unload', 'this.tickState = "unload";');

            var parent = new Wick.Base();
            parent.addChild(tickable);

            parent.onScreen = false;
            tickable.tick();

            parent.onScreen = true;
            tickable.tick();
            expect(tickable.tickState).to.equal('load');
            tickable.tick();
            expect(tickable.tickState).to.equal('update');
            tickable.tick();
            expect(tickable.tickState).to.equal('update');

            parent.onScreen = false;
            tickable.tick();
            expect(tickable.tickState).to.equal('unload');
        });

        it('should run empty script without errors', function() {
            var tickable = new Wick.Tickable();
            tickable.addScript('load', '');

            var parent = new Wick.Base();
            parent.addChild(tickable);
            parent.onScreen = false;

            var error = tickable.tick();
            expect(error).to.equal(null);
        });

        it('should set a property on load without error', function() {
            var tickable = new Wick.Tickable();
            tickable.addScript('load', 'this.randomVariable = "loaded";');

            var parent = new Wick.Base();
            parent.addChild(tickable);
            parent.onScreen = true;

            tickable.tick();
            expect(tickable.randomVariable).to.equal("loaded");
        });

        it('should set a variable on load without error', function() {
            var tickable = new Wick.Tickable();
            tickable.addScript('load', 'var randomVariable = "a"; this.randomVariable = randomVariable');

            var parent = new Wick.Base();
            parent.addChild(tickable);
            parent.onScreen = true;

            tickable.tick();
            expect(tickable.randomVariable).to.equal("a");
        });

        it('should update a property over multiple ticks', function() {
            var tickable = new Wick.Tickable();
            tickable.addScript('load', 'this.randomVariable = 0;');
            tickable.addScript('update', 'this.randomVariable += 1;');
            tickable.addScript('unload', 'this.randomVariable = null;');

            var parent = new Wick.Base();
            parent.addChild(tickable);
            parent.onScreen = true;

            tickable.tick();
            expect(tickable.randomVariable).to.equal(0);

            tickable.tick();
            expect(tickable.randomVariable).to.equal(1);

            tickable.tick();
            expect(tickable.randomVariable).to.equal(2);

            parent.onScreen = false;
            tickable.tick();
            expect(tickable.randomVariable).to.equal(null);

            parent.onScreen = true;
            tickable.tick();
            expect(tickable.randomVariable).to.equal(0);
        });

        it('should return correct info for a syntax error', function() {
            var tickable = new Wick.Tickable();

            // Add tickable to a parent so we can tick it!
            var parent = new Wick.Base();
            parent.addChild(tickable);
            parent.onScreen = true;

            tickable.addScript('load', 'fn();\nfn(');
            tickable.addScript('update', 'fn()\nfn()\nfn(');

            var error = tickable.tick();
            expect(error).to.not.equal(null);
            expect(error.name).to.equal('load');
            expect(error.lineNumber).to.equal(2);
            expect(error.message).to.equal('Unexpected end of input');
            expect(error.uuid).to.equal(tickable.uuid);

            var error = tickable.tick();
            expect(error).to.not.equal(null);
            expect(error.name).to.equal('update');
            expect(error.lineNumber).to.equal(3);
            expect(error.message).to.equal('Unexpected end of input');
            expect(error.uuid).to.equal(tickable.uuid);
        });

        it('should return correct info for a runtime error', function() {
            var tickable = new Wick.Tickable();
            tickable.addScript('load', 'thisWillCauseAnError();');
            tickable.addScript('update', 'var i = 0;\ni++\n\nthisWillCauseAnError();');

            var parent = new Wick.Base();
            parent.addChild(tickable);
            parent.onScreen = true;

            var error = tickable.tick();
            expect(error).to.not.equal(null);
            expect(error.lineNumber).to.equal(1);
            expect(error.message).to.equal('thisWillCauseAnError is not defined');
            expect(error.uuid).to.equal(tickable.uuid);

            var error = tickable.tick();
            expect(error).to.not.equal(null);
            expect(error.lineNumber).to.equal(4);
            expect(error.message).to.equal('thisWillCauseAnError is not defined');
            expect(error.uuid).to.equal(tickable.uuid);
        });

        it('should run correct mouse scripts for different mouse states', function() {
            var clip = new Wick.Clip();
            clip.addScript('mouseenter', 'this.__mouseenter = true;');
            clip.addScript('mousepressed', 'this.__mousepressed = true;');
            clip.addScript('mousedown', 'this.__mousedown = true;');
            clip.addScript('mousereleased', 'this.__mousereleased = true;');
            clip.addScript('mouseleave', 'this.__mouseleave = true;');
            clip.addScript('mousehover', 'this.__mousehover = true;');
            clip.addScript('mousedrag', 'this.__mousedrag = true;');
            clip.addScript('mouseclick', 'this.__mouseclick = true;');

            function resetMouseStateFlags () {
                clip.__mouseenter = false;
                clip.__mousepressed = false;
                clip.__mousedown = false;
                clip.__mousereleased = false;
                clip.__mouseleave = false;
                clip.__mousehover = false;
                clip.__mousedrag = false;
                clip.__mouseclick = false;
            }

            var project = new Wick.Project();
            project.activeFrame.addClip(clip);

            //project.view.render();

            resetMouseStateFlags();
            clip.view._mouseState = 'out';
            expect(project.focus.tick()).to.equal(null);
            expect(clip.__mouseenter).to.equal(false);
            expect(clip.__mousepressed).to.equal(false);
            expect(clip.__mousedown).to.equal(false);
            expect(clip.__mousereleased).to.equal(false);
            expect(clip.__mouseleave).to.equal(false);
            expect(clip.__mousehover).to.equal(false);
            expect(clip.__mousedrag).to.equal(false);
            expect(clip.__mouseclick).to.equal(false);

            resetMouseStateFlags();
            clip.view._mouseState = 'over';
            expect(project.focus.tick()).to.equal(null);
            expect(clip.__mouseenter).to.equal(true);
            expect(clip.__mousepressed).to.equal(false);
            expect(clip.__mousedown).to.equal(false);
            expect(clip.__mousereleased).to.equal(false);
            expect(clip.__mouseleave).to.equal(false);
            expect(clip.__mousehover).to.equal(true);
            expect(clip.__mousedrag).to.equal(false);
            expect(clip.__mouseclick).to.equal(false);

            resetMouseStateFlags();
            clip.view._mouseState = 'down';
            expect(project.focus.tick()).to.equal(null);
            expect(clip.__mouseenter).to.equal(false);
            expect(clip.__mousepressed).to.equal(true);
            expect(clip.__mousedown).to.equal(true);
            expect(clip.__mousereleased).to.equal(false);
            expect(clip.__mouseleave).to.equal(false);
            expect(clip.__mousehover).to.equal(false);
            expect(clip.__mousedrag).to.equal(false);
            expect(clip.__mouseclick).to.equal(false);

            resetMouseStateFlags();
            clip.view._mouseState = 'down';
            expect(project.focus.tick()).to.equal(null);
            expect(clip.__mouseenter).to.equal(false);
            expect(clip.__mousepressed).to.equal(false);
            expect(clip.__mousedown).to.equal(true);
            expect(clip.__mousereleased).to.equal(false);
            expect(clip.__mouseleave).to.equal(false);
            expect(clip.__mousehover).to.equal(false);
            expect(clip.__mousedrag).to.equal(true);
            expect(clip.__mouseclick).to.equal(false);

            resetMouseStateFlags();
            clip.view._mouseState = 'over';
            expect(project.focus.tick()).to.equal(null);
            expect(clip.__mouseenter).to.equal(false);
            expect(clip.__mousepressed).to.equal(false);
            expect(clip.__mousedown).to.equal(false);
            expect(clip.__mousereleased).to.equal(true);
            expect(clip.__mouseleave).to.equal(false);
            expect(clip.__mousehover).to.equal(true);
            expect(clip.__mousedrag).to.equal(false);
            expect(clip.__mouseclick).to.equal(true);

            resetMouseStateFlags();
            clip.view._mouseState = 'out';
            expect(project.focus.tick()).to.equal(null);
            expect(clip.__mouseenter).to.equal(false);
            expect(clip.__mousepressed).to.equal(false);
            expect(clip.__mousedown).to.equal(false);
            expect(clip.__mousereleased).to.equal(false);
            expect(clip.__mouseleave).to.equal(true);
            expect(clip.__mousehover).to.equal(false);
            expect(clip.__mousedrag).to.equal(false);
            expect(clip.__mouseclick).to.equal(false);

            resetMouseStateFlags();
            clip.view._mouseState = 'over';
            expect(project.focus.tick()).to.equal(null);
            expect(clip.__mouseenter).to.equal(true);
            expect(clip.__mousepressed).to.equal(false);
            expect(clip.__mousedown).to.equal(false);
            expect(clip.__mousereleased).to.equal(false);
            expect(clip.__mouseleave).to.equal(false);
            expect(clip.__mousehover).to.equal(true);
            expect(clip.__mousedrag).to.equal(false);
            expect(clip.__mouseclick).to.equal(false);

            resetMouseStateFlags();
            clip.view._mouseState = 'over';
            expect(project.focus.tick()).to.equal(null);
            expect(clip.__mouseenter).to.equal(false);
            expect(clip.__mousepressed).to.equal(false);
            expect(clip.__mousedown).to.equal(false);
            expect(clip.__mousereleased).to.equal(false);
            expect(clip.__mouseleave).to.equal(false);
            expect(clip.__mousehover).to.equal(true);
            expect(clip.__mousedrag).to.equal(false);
            expect(clip.__mouseclick).to.equal(false);

            resetMouseStateFlags();
            clip.view._mouseState = 'down';
            expect(project.focus.tick()).to.equal(null);
            expect(clip.__mouseenter).to.equal(false);
            expect(clip.__mousepressed).to.equal(true);
            expect(clip.__mousedown).to.equal(true);
            expect(clip.__mousereleased).to.equal(false);
            expect(clip.__mouseleave).to.equal(false);
            expect(clip.__mousehover).to.equal(false);
            expect(clip.__mousedrag).to.equal(false);
            expect(clip.__mouseclick).to.equal(false);

            resetMouseStateFlags();
            clip.view._mouseState = 'down';
            expect(project.focus.tick()).to.equal(null);
            expect(clip.__mouseenter).to.equal(false);
            expect(clip.__mousepressed).to.equal(false);
            expect(clip.__mousedown).to.equal(true);
            expect(clip.__mousereleased).to.equal(false);
            expect(clip.__mouseleave).to.equal(false);
            expect(clip.__mousehover).to.equal(false);
            expect(clip.__mousedrag).to.equal(true);
            expect(clip.__mouseclick).to.equal(false);

            resetMouseStateFlags();
            clip.view._mouseState = 'out';
            expect(project.focus.tick()).to.equal(null);
            expect(clip.__mouseenter).to.equal(false);
            expect(clip.__mousepressed).to.equal(false);
            expect(clip.__mousedown).to.equal(false);
            expect(clip.__mousereleased).to.equal(false);
            expect(clip.__mouseleave).to.equal(true);
            expect(clip.__mousehover).to.equal(false);
            expect(clip.__mousedrag).to.equal(false);
            expect(clip.__mouseclick).to.equal(false);

            resetMouseStateFlags();
            clip.view._mouseState = 'over';
            expect(project.focus.tick()).to.equal(null);
            expect(clip.__mouseenter).to.equal(true);
            expect(clip.__mousepressed).to.equal(false);
            expect(clip.__mousedown).to.equal(false);
            expect(clip.__mousereleased).to.equal(false);
            expect(clip.__mouseleave).to.equal(false);
            expect(clip.__mousehover).to.equal(true);
            expect(clip.__mousedrag).to.equal(false);
            expect(clip.__mouseclick).to.equal(false);

            resetMouseStateFlags();
            clip.view._mouseState = 'down';
            expect(project.focus.tick()).to.equal(null);
            expect(clip.__mouseenter).to.equal(false);
            expect(clip.__mousepressed).to.equal(true);
            expect(clip.__mousedown).to.equal(true);
            expect(clip.__mousereleased).to.equal(false);
            expect(clip.__mouseleave).to.equal(false);
            expect(clip.__mousehover).to.equal(false);
            expect(clip.__mousedrag).to.equal(false);
            expect(clip.__mouseclick).to.equal(false);

            resetMouseStateFlags();
            clip.view._mouseState = 'over';
            expect(project.focus.tick()).to.equal(null);
            expect(clip.__mouseenter).to.equal(false);
            expect(clip.__mousepressed).to.equal(false);
            expect(clip.__mousedown).to.equal(false);
            expect(clip.__mousereleased).to.equal(true);
            expect(clip.__mouseleave).to.equal(false);
            expect(clip.__mousehover).to.equal(true);
            expect(clip.__mousedrag).to.equal(false);
            expect(clip.__mouseclick).to.equal(true);

            resetMouseStateFlags();
            clip.view._mouseState = 'over';
            expect(project.focus.tick()).to.equal(null);
            expect(clip.__mouseenter).to.equal(false);
            expect(clip.__mousepressed).to.equal(false);
            expect(clip.__mousedown).to.equal(false);
            expect(clip.__mousereleased).to.equal(false);
            expect(clip.__mouseleave).to.equal(false);
            expect(clip.__mousehover).to.equal(true);
            expect(clip.__mousedrag).to.equal(false);
            expect(clip.__mouseclick).to.equal(false);
        });
    });
});
