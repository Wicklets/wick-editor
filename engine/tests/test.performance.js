describe('#performance', function () {
    describe('#History', function () {
        //todo...
    });

    describe('#View', function () {
        //todo...
    });

    describe('#GUIElement', function () {
        it('warmup', function () {
            var project = new Wick.Project();
            project.activeFrame.remove();

            // Three frames
            var layer1 = project.activeLayer;
            layer1.addFrame(new Wick.Frame({start: 1}));
            layer1.addFrame(new Wick.Frame({start: 2}));
            layer1.addFrame(new Wick.Frame({start: 3}));

            project.guiElement.build();
            project.guiElement.build();
        });

        it('three frames', function () {
            var project = new Wick.Project();
            project.activeFrame.remove();

            // Three frames
            var layer1 = project.activeLayer;
            layer1.addFrame(new Wick.Frame({start: 1}));
            layer1.addFrame(new Wick.Frame({start: 2}));
            layer1.addFrame(new Wick.Frame({start: 3}));

            // Render timeline and time how long it took
            console.log('--- basic perf test ---');
            TestUtils.timeFunction(() => {
                project.guiElement.build();
            }, 'init build');
            TestUtils.timeFunction(() => {
                project.guiElement.build();
            }, 'second build');
            TestUtils.timeFunction(() => {
                project.guiElement.build();
            }, 'third build');
        });

        it('many frames of all types', function () {
            var project = new Wick.Project();
            project.activeFrame.remove();

            // Three blank frames
            var layer1 = project.activeLayer;
            layer1.addFrame(new Wick.Frame({start: 1}));
            layer1.addFrame(new Wick.Frame({start: 2}));
            layer1.addFrame(new Wick.Frame({start: 3}));

            // Thirty contentful frames
            var layer2 = new Wick.Layer();
            project.activeTimeline.addLayer(layer2);
            for(var i = 0; i < 30; i++) {
                var frame = new Wick.Frame({start: i});
                frame.addPath(TestUtils.paperToWickPath(new paper.Path.Rectangle({
                    to: [0,0],
                    from: [30,30],
                    fillColor: 'red',
                })));
                layer2.addFrame(frame);
            }

            // Render timeline and time how long it took
            console.log('--- heavy perf test ---');
            TestUtils.timeFunction(() => {
                project.guiElement.build();
            }, 'init build');
            TestUtils.timeFunction(() => {
                project.guiElement.build();
            }, 'second build');
            TestUtils.timeFunction(() => {
                project.guiElement.build();
            }, 'third build');
        });
    });

    describe('#Project', function () {
        it('tick clip with no path children', function() {
            return;
            console.log(this.test.title);

            var project = new Wick.Project();
            var clip = new Wick.Clip();
            for(var i = 0; i < 0; i++) {
                clip.activeFrame.addPath(TestUtils.paperToWickPath(new paper.Path.Rectangle({
                    from: new paper.Point(0,0),
                    to: new paper.Point(50,50),
                    fillColor: 'red',
                })))
            }
            project.activeFrame.addClip(clip);

            for(var i = 0; i < 100; i++) {
                var clone = clip.clone();
                /*clone.addScript('load', 'this.updateCount = 0;');
                clone.addScript('update', 'this.updateCount ++;');*/
                clone.addScript('default', 'onEvent("load", () => {this.updateCount = 0;}); onEvent("update", () => {this.updateCount ++;});')
                project.activeFrame.addClip(clone);
            }

            for(var i = 0; i < 7; i++) {
                var s = +new Date();
                project.tick();
                console.log((+new Date())-s);
                console.log('')
            }

            Wick.ObjectCache.clear();
        });

        it('tick clip with 250 path children', function() {
            return;
            console.log(this.test.title);

            var project = new Wick.Project();
            var clip = new Wick.Clip();
            for(var i = 0; i < 250; i++) {
                clip.activeFrame.addPath(TestUtils.paperToWickPath(new paper.Path.Rectangle({
                    from: new paper.Point(0,0),
                    to: new paper.Point(50,50),
                    fillColor: 'red',
                })))
            }
            project.activeFrame.addClip(clip);

            for(var i = 0; i < 100; i++) {
                var clone = clip.clone();
                /*clone.addScript('load', 'this.updateCount = 0;');
                clone.addScript('update', 'this.updateCount ++;');*/
                clone.addScript('default', 'onEvent("load", () => {this.updateCount = 0;}); onEvent("update", () => {this.updateCount ++;});')
                project.activeFrame.addClip(clone);
            }

            for(var i = 0; i < 7; i++) {
                var s = +new Date();
                project.tick();
                console.log((+new Date())-s);
                console.log('')
            }

            Wick.ObjectCache.clear();
        });
    });
});
