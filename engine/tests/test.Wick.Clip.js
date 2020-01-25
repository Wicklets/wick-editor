describe('Wick.Clip', function() {
    describe('#constructor', function () {
        it('should instantiate correctly', function() {
            var clip = new Wick.Clip({
                identifier: 'foo'
            });
            expect(clip instanceof Wick.Base).to.equal(true);
            expect(clip instanceof Wick.Tickable).to.equal(true);
            expect(clip instanceof Wick.Clip).to.equal(true);
            expect(clip.classname).to.equal('Clip');
            expect(clip.identifier).to.equal('foo');
            expect(clip.timeline instanceof Wick.Timeline).to.equal(true);
        });

        it('should instantiate correctly with existing objects (no transform)', function() {
            var project = new Wick.Project();

            var path1 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
                center: new paper.Point(25,25),
                radius: 25,
                fillColor: 'red',
            }))
            var path2 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
                center: new paper.Point(75,75),
                radius: 25,
                fillColor: 'red',
            }))
            var clip1 = new Wick.Clip({ identifier: 'bar' });
            var clip2 = new Wick.Clip({ identifier: 'baz' });

            project.activeFrame.addPath(path1);
            project.activeFrame.addPath(path2);
            project.activeFrame.addClip(clip1);
            project.activeFrame.addClip(clip2);

            var clip = new Wick.Clip({
                identifier: 'foo',
                objects: [
                    path1,
                    path2,
                    clip1,
                    clip2,
                ],
            });
            expect(clip instanceof Wick.Base).to.equal(true);
            expect(clip instanceof Wick.Tickable).to.equal(true);
            expect(clip instanceof Wick.Clip).to.equal(true);
            expect(clip.classname).to.equal('Clip');
            expect(clip.identifier).to.equal('foo');
            expect(clip.transformation.x).to.equal(0);
            expect(clip.transformation.y).to.equal(0);
            expect(clip.activeFrame.paths.length).to.equal(2);
            expect(clip.activeFrame.clips.length).to.equal(2);

            expect(clip.activeFrame.paths[0].x).to.equal(25);
            expect(clip.activeFrame.paths[0].y).to.equal(25);
            expect(clip.activeFrame.paths[1].x).to.equal(75);
            expect(clip.activeFrame.paths[1].y).to.equal(75);
        });

        it('should instantiate correctly with existing objects (with transform)', function() {
            var project = new Wick.Project();

            var path1 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
                center: new paper.Point(25,25),
                radius: 25,
                fillColor: 'red',
            }))
            var path2 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
                center: new paper.Point(75,75),
                radius: 25,
                fillColor: 'red',
            }))
            var clip1 = new Wick.Clip({ identifier: 'bar' });
            var clip2 = new Wick.Clip({ identifier: 'baz' });

            project.activeFrame.addPath(path1);
            project.activeFrame.addPath(path2);
            project.activeFrame.addClip(clip1);
            project.activeFrame.addClip(clip2);

            var clip = new Wick.Clip({
                identifier: 'foo',
                transformation: new Wick.Transformation({
                    x: 100,
                    y: 50,
                }),
                objects: [
                    path1,
                    path2,
                    clip1,
                    clip2,
                ],
            });
            expect(clip instanceof Wick.Base).to.equal(true);
            expect(clip instanceof Wick.Tickable).to.equal(true);
            expect(clip instanceof Wick.Clip).to.equal(true);
            expect(clip.classname).to.equal('Clip');
            expect(clip.identifier).to.equal('foo');
            expect(clip.transformation.x).to.equal(100);
            expect(clip.transformation.y).to.equal(50);
            expect(clip.activeFrame.paths.length).to.equal(2);
            expect(clip.activeFrame.clips.length).to.equal(2);

            expect(clip.activeFrame.paths[0].x).to.equal(25 - clip.transformation.x);
            expect(clip.activeFrame.paths[0].y).to.equal(25 - clip.transformation.y);
            expect(clip.activeFrame.paths[1].x).to.equal(75 - clip.transformation.x);
            expect(clip.activeFrame.paths[1].y).to.equal(75 - clip.transformation.y);
        });
    });

    describe('#copy', function () {
        it('should copy correctly (empty clip)', function() {
            var clip = new Wick.Clip({
                identifier: 'foo'
            });

            var copy = clip.copy();

            expect(copy instanceof Wick.Base).to.equal(true);
            expect(copy instanceof Wick.Tickable).to.equal(true);
            expect(copy instanceof Wick.Clip).to.equal(true);
            expect(copy.classname).to.equal('Clip');
            expect(copy.identifier).to.equal('foo');
            expect(copy.timeline instanceof Wick.Timeline).to.equal(true);
        });

        it('should copy correctly (with child paths)', function() {
            var project = new Wick.Project();

            var path1 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
                center: new paper.Point(25,25),
                radius: 25,
                fillColor: 'red',
            }))
            var path2 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
                center: new paper.Point(75,75),
                radius: 25,
                fillColor: 'red',
            }))

            project.activeFrame.addPath(path1);
            project.activeFrame.addPath(path2);

            var clip = new Wick.Clip({
                identifier: 'foo',
                objects: [
                    path1,
                    path2,
                ],
            });

            var copy = clip.copy();

            expect(clip instanceof Wick.Base).to.equal(true);
            expect(clip instanceof Wick.Tickable).to.equal(true);
            expect(clip instanceof Wick.Clip).to.equal(true);
            expect(clip.classname).to.equal('Clip');
            expect(clip.identifier).to.equal('foo');
            expect(clip.transformation.x).to.equal(0);
            expect(clip.transformation.y).to.equal(0);
            expect(clip.activeFrame.paths.length).to.equal(2);
            expect(clip.activeFrame.clips.length).to.equal(0);

            expect(clip.activeFrame.paths[0].view.item.bounds.topLeft.x).to.equal(0);
            expect(clip.activeFrame.paths[0].view.item.bounds.topLeft.y).to.equal(0);
            expect(clip.activeFrame.paths[1].view.item.bounds.topLeft.x).to.equal(50);
            expect(clip.activeFrame.paths[1].view.item.bounds.topLeft.y).to.equal(50);

            expect(copy instanceof Wick.Base).to.equal(true);
            expect(copy instanceof Wick.Tickable).to.equal(true);
            expect(copy instanceof Wick.Clip).to.equal(true);
            expect(copy.classname).to.equal('Clip');
            expect(copy.identifier).to.equal('foo');
            expect(copy.transformation.x).to.equal(0);
            expect(copy.transformation.y).to.equal(0);
            expect(copy.activeFrame.paths.length).to.equal(2);
            expect(copy.activeFrame.clips.length).to.equal(0);

            expect(copy.activeFrame.paths[0].view.item.bounds.topLeft.x).to.equal(0);
            expect(copy.activeFrame.paths[0].view.item.bounds.topLeft.y).to.equal(0);
            expect(copy.activeFrame.paths[1].view.item.bounds.topLeft.x).to.equal(50);
            expect(copy.activeFrame.paths[1].view.item.bounds.topLeft.y).to.equal(50);
        });

        it('should copy correctly (with child clips)', function() {
            var project = new Wick.Project();

            var path1 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
                center: new paper.Point(25,25),
                radius: 25,
                fillColor: 'red',
            }))
            var path2 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
                center: new paper.Point(75,75),
                radius: 25,
                fillColor: 'red',
            }))
            var clip1 = new Wick.Clip({ identifier: 'bar' });
            var clip2 = new Wick.Clip({ identifier: 'baz' });

            project.activeFrame.addPath(path1);
            project.activeFrame.addPath(path2);
            project.activeFrame.addClip(clip1);
            project.activeFrame.addClip(clip2);

            var clip = new Wick.Clip({
                identifier: 'foo',
                objects: [
                    path1,
                    path2,
                    clip1,
                    clip2,
                ],
            });

            var copy = clip.copy();

            expect(clip instanceof Wick.Base).to.equal(true);
            expect(clip instanceof Wick.Tickable).to.equal(true);
            expect(clip instanceof Wick.Clip).to.equal(true);
            expect(clip.classname).to.equal('Clip');
            expect(clip.identifier).to.equal('foo');
            expect(clip.transformation.x).to.equal(0);
            expect(clip.transformation.y).to.equal(0);
            expect(clip.activeFrame.paths.length).to.equal(2);
            expect(clip.activeFrame.clips.length).to.equal(2);

            expect(clip.activeFrame.paths[0].view.item.bounds.topLeft.x).to.equal(0);
            expect(clip.activeFrame.paths[0].view.item.bounds.topLeft.y).to.equal(0);
            expect(clip.activeFrame.paths[1].view.item.bounds.topLeft.x).to.equal(50);
            expect(clip.activeFrame.paths[1].view.item.bounds.topLeft.y).to.equal(50);

            expect(copy instanceof Wick.Base).to.equal(true);
            expect(copy instanceof Wick.Tickable).to.equal(true);
            expect(copy instanceof Wick.Clip).to.equal(true);
            expect(copy.classname).to.equal('Clip');
            expect(copy.identifier).to.equal('foo');
            expect(copy.transformation.x).to.equal(0);
            expect(copy.transformation.y).to.equal(0);
            expect(copy.activeFrame.paths.length).to.equal(2);
            expect(copy.activeFrame.clips.length).to.equal(2);

            expect(copy.activeFrame.paths[0].view.item.bounds.topLeft.x).to.equal(0);
            expect(copy.activeFrame.paths[0].view.item.bounds.topLeft.y).to.equal(0);
            expect(copy.activeFrame.paths[1].view.item.bounds.topLeft.x).to.equal(50);
            expect(copy.activeFrame.paths[1].view.item.bounds.topLeft.y).to.equal(50);
        });
    });

    describe('#lineage', function () {
        it('should determine lineage correctly', function () {
            var project = new Wick.Project();

            var greatGrandParent = new Wick.Clip();
            greatGrandParent.timeline.addLayer(new Wick.Layer());
            greatGrandParent.activeLayer.addFrame(new Wick.Frame());
            project.activeFrame.addClip(greatGrandParent);

            var grandparent = new Wick.Clip();
            grandparent.timeline.addLayer(new Wick.Layer());
            grandparent.activeLayer.addFrame(new Wick.Frame());
            greatGrandParent.activeFrame.addClip(grandparent);

            var parent = new Wick.Clip();
            parent.timeline.addLayer(new Wick.Layer());
            parent.activeLayer.addFrame(new Wick.Frame());
            grandparent.activeFrame.addClip(parent);

            var child = new Wick.Clip();
            child.timeline.addLayer(new Wick.Layer());
            child.activeLayer.addFrame(new Wick.Frame());
            parent.activeFrame.addClip(child);

            var lineage = child.lineage;
            expect(lineage[0]).to.equal(child);
            expect(lineage[1]).to.equal(parent);
            expect(lineage[2]).to.equal(grandparent);
            expect(lineage[3]).to.equal(greatGrandParent);
            expect(lineage[4]).to.equal(project.root);
        });
    });

    describe('#onScreen', function () {
        it('should only be considered on screen if the parent playhead is over the frame', function () {
            var project = new Wick.Project();

            var frame1 = project.activeFrame;
            var frame2 = new Wick.Frame({start: 2});
            project.activeLayer.addFrame(frame2);

            var clip1 = new Wick.Clip();
            frame1.addClip(clip1);
            var clip2 = new Wick.Clip();
            frame2.addClip(clip2);

            project.activeTimeline.playheadPosition = 1;
            expect(clip1.onScreen).to.equal(true);
            expect(clip2.onScreen).to.equal(false);

            project.activeTimeline.playheadPosition = 2;
            expect(clip1.onScreen).to.equal(false);
            expect(clip2.onScreen).to.equal(true);
        });

        it('should not be on screen if the parent playhead is over the frame, but the parent clip is not on screen', function () {
            var project = new Wick.Project();
            var toplevelClip = new Wick.Clip();
            project.activeFrame.addClip(toplevelClip);

            var frame1 = toplevelClip.activeFrame;
            var frame2 = new Wick.Frame({start: 2});
            toplevelClip.activeLayer.addFrame(frame2);

            var clip1 = new Wick.Clip();
            frame1.addClip(clip1);
            var clip2 = new Wick.Clip();
            frame2.addClip(clip2);

            project.activeTimeline.playheadPosition = 1;
            expect(clip1.onScreen).to.equal(true);
            expect(clip2.onScreen).to.equal(false);

            project.activeTimeline.playheadPosition = 2;
            expect(clip1.onScreen).to.equal(false);
            expect(clip2.onScreen).to.equal(false);
        });
    });

    describe('#breakApart', function () {
        it('should break apart correctly', function () {
            var project = new Wick.Project();

            var path1 = new Wick.Path({json: TestUtils.TEST_PATH_JSON_RED_SQUARE});
            var path2 = new Wick.Path({json: TestUtils.TEST_PATH_JSON_BLUE_SQUARE});
            var clip1 = new Wick.Clip({ identifier: 'bar' });
            var clip2 = new Wick.Clip({ identifier: 'baz' });

            project.activeFrame.addPath(path1);
            project.activeFrame.addPath(path2);
            project.activeFrame.addClip(clip1);
            project.activeFrame.addClip(clip2);

            var clip = new Wick.Clip({
                identifier: 'foo',
                objects: [
                    path1,
                    path2,
                    clip1,
                    clip2,
                ],
                transformation: new Wick.Transformation({
                    x: 200,
                    y: 100,
                }),
            });
            project.activeFrame.addClip(clip);

            expect(project.activeFrame.clips.length).to.equal(1);
            expect(project.activeFrame.clips[0]).to.equal(clip);
            expect(project.activeFrame.paths.length).to.equal(0);

            project.activeFrame.clips[0].breakApart();

            expect(project.activeFrame.clips.length).to.equal(2);
            expect(project.activeFrame.clips[0]).to.equal(clip1);
            expect(project.activeFrame.clips[1]).to.equal(clip2);
            expect(project.activeFrame.paths.length).to.equal(2);
            expect(project.activeFrame.paths[0]).to.equal(path1);
            expect(project.activeFrame.paths[1]).to.equal(path2);
        });
    });

    describe('#tick', function () {
        it('should advance timeline on update', function() {
            var project = new Wick.Project();
            var clip = new Wick.Clip();
            clip.timeline.addLayer(new Wick.Layer());
            clip.timeline.layers[0].addFrame(new Wick.Frame({start:1}));
            clip.timeline.layers[0].addFrame(new Wick.Frame({start:2}));
            project.addObject(clip);

            expect(clip.timeline.playheadPosition).to.equal(1);
            project.tick();
            project.tick();
            expect(clip.timeline.playheadPosition).to.equal(2);
        });

        it('script errors from child frame should bubble up', function() {
            var project = new Wick.Project();
            var clip = new Wick.Clip();
            project.activeFrame.addClip(clip);

            clip.timeline.addLayer(new Wick.Layer());

            var child = new Wick.Frame();
            child.addScript('load', 'thisWillCauseAnError()');
            clip.timeline.layers[0].addFrame(child);

            var error = project.tick();
            expect(error).to.not.equal(null);
            expect(error.message).to.equal('thisWillCauseAnError is not defined');
            expect(error.lineNumber).to.equal(1);
            expect(error.uuid).to.equal(child.uuid);
        });

        it('script errors from child clip should bubble up', function() {
            var project = new Wick.Project();
            var clip = new Wick.Clip();
            project.activeFrame.addClip(clip);

            clip.timeline.addLayer(new Wick.Layer());
            clip.timeline.layers[0].addFrame(new Wick.Frame());

            var child = new Wick.Clip();
            child.addScript('load', 'thisWillCauseAnError()');
            clip.timeline.activeFrame.addClip(child);

            var error = project.tick();
            expect(error).to.not.equal(null);
            expect(error.message).to.equal('thisWillCauseAnError is not defined');
            expect(error.lineNumber).to.equal(1);
            expect(error.uuid).to.equal(child.uuid);
        });

        it('script errors from deeply nested child clips should bubble up', function() {
            function addChildClipToParentClip (clip) {
                clip.timeline.addLayer(new Wick.Layer());
                clip.timeline.layers[0].addFrame(new Wick.Frame());

                var child = new Wick.Clip();
                clip.timeline.activeFrame.addClip(child);

                return child;
            }

            var maxDepth = 10;
            for(var depth = 1; depth < maxDepth; depth ++) {
                var project = new Wick.Project();
                var parentClip = new Wick.Clip();
                project.addObject(parentClip);

                var clip = parentClip;
                for(var i = 0; i < depth; i++) {
                    clip = addChildClipToParentClip(clip);
                }
                clip.addScript('load', 'thisWillCauseAnError()');

                var error = project.tick();
                expect(error).to.not.equal(null);
                expect(error.message).to.equal('thisWillCauseAnError is not defined');
                expect(error.lineNumber).to.equal(1);
                expect(error.uuid).to.equal(clip.uuid);
            }
        });

        it('scripts should stop execution after error', function() {
            var project = new Wick.Project();

            var clip = new Wick.Clip();
            project.addObject(clip);

            clip.timeline.addLayer(new Wick.Layer());
            clip.timeline.layers[0].addFrame(new Wick.Frame());

            var childA = new Wick.Clip();
            childA.addScript('load', 'this.__scriptDidRun = true;');
            clip.timeline.layers[0].frames[0].addClip(childA);

            var childB = new Wick.Clip();
            childB.addScript('load', 'this.__scriptDidRun = true;thisCausesAnError();');
            clip.timeline.layers[0].frames[0].addClip(childB);

            var childC = new Wick.Clip();
            childC.addScript('load', 'this.__scriptDidRun = true;');
            clip.timeline.layers[0].frames[0].addClip(childC);

            var result = project.tick();
            expect(childA.__scriptDidRun).to.equal(true);
            expect(childB.__scriptDidRun).to.equal(true);
            expect(childC.__scriptDidRun).to.equal(undefined);
        });

        it('unload script should run if clip stops being visible', function() {
            window.tempHolder = [];

            var project = new Wick.Project();

            var clip = new Wick.Clip();
            clip.addScript('load', 'window.tempHolder.push("load")');
            clip.addScript('unload', 'window.tempHolder.push("unload")');

            var frame1 = project.activeFrame;
            var frame2 = new Wick.Frame({start:2});
            project.activeLayer.addFrame(frame2);

            frame1.addClip(clip);

            project.tick();
            expect(project.focus.timeline.playheadPosition).to.equal(1);
            project.tick();
            expect(project.focus.timeline.playheadPosition).to.equal(2);

            expect(window.tempHolder[0]).to.equal('load');
            expect(window.tempHolder[1]).to.equal('unload');
            expect(window.tempHolder.length).to.equal(2);

            delete window.tempHolder;
        });

        it('unload script should run if clip stops being visible (nested clip)', function() {
            window.tempHolder = [];

            var project = new Wick.Project();

            var innerClip = new Wick.Clip();
            innerClip.addScript('load', 'window.tempHolder.push("load")');
            innerClip.addScript('unload', 'window.tempHolder.push("unload")');

            var outerClip = new Wick.Clip();
            outerClip.activeFrame.addClip(innerClip);

            var frame1 = project.activeFrame;
            var frame2 = new Wick.Frame({start:2});
            project.activeLayer.addFrame(frame2);

            frame1.addClip(outerClip);

            project.tick();
            expect(project.focus.timeline.playheadPosition).to.equal(1);
            project.tick();
            expect(project.focus.timeline.playheadPosition).to.equal(2);

            expect(window.tempHolder[0]).to.equal('load');
            expect(window.tempHolder[1]).to.equal('unload');
            expect(window.tempHolder.length).to.equal(2);

            delete window.tempHolder;
        });

        describe('#stop', function () {
            it('stop should work as expected', function() {
                var project = new Wick.Project();
                project.activeFrame.end = 10;

                var clip = new Wick.Clip();
                project.activeFrame.addClip(clip);

                clip.addScript('load', 'stop()');

                project.tick();
                project.tick();
                expect(project.focus.timeline.playheadPosition).to.equal(1);
                project.tick();
                expect(project.focus.timeline.playheadPosition).to.equal(1);
            });

            it('this.stop should work as expected', function() {
                var project = new Wick.Project();

                var clip = new Wick.Clip();
                project.activeFrame.addClip(clip);

                clip.addScript('load', 'this.stop()');
                clip.activeFrame.end = 10;

                project.tick();
                project.tick();
                expect(clip.timeline.playheadPosition).to.equal(1);
                project.tick();
                expect(clip.timeline.playheadPosition).to.equal(1);
            });

            it('otherClip.stop should work as expected', function() {
                var project = new Wick.Project();

                var clip = new Wick.Clip();
                clip.addScript('load', 'otherClip.stop();')
                project.activeFrame.addClip(clip);

                var otherClip = new Wick.Clip();
                otherClip.identifier = 'otherClip';
                otherClip.timeline.addLayer(new Wick.Layer());
                otherClip.timeline.layers[0].addFrame(new Wick.Frame({start:1,end:10}));
                project.activeFrame.addClip(otherClip);

                project.tick();
                project.tick();

                expect(otherClip.timeline.playheadPosition).to.equal(1);
            });
        });

        describe('#play', function () {
            it('play should work as expected', function() {
                var project = new Wick.Project();
                project.activeFrame.end = 10;
                project.focus.timeline._playing = false;

                var clip = new Wick.Clip();
                project.activeFrame.addClip(clip);

                clip.addScript('load', 'play()');

                project.tick();
                project.tick();
                expect(project.focus.timeline.playheadPosition).to.equal(2);
                project.tick();
                expect(project.focus.timeline.playheadPosition).to.equal(3);
            });

            it('this.play should work as expected', function() {
                var project = new Wick.Project();

                var clip = new Wick.Clip();
                clip.timeline._playing = false;
                project.activeFrame.addClip(clip);

                clip.addScript('load', 'this.play();');
                clip.activeFrame.end = 10;

                project.tick();
                project.tick();
                expect(clip.timeline.playheadPosition).to.equal(2);
                //project.tick();
                //expect(clip.timeline.playheadPosition).to.equal(3);
            });
        });

        describe('#gotoAndStop', function () {
            it('this.gotoAndStop (frame number) should work as expected', function() {
                var project = new Wick.Project();

                var clip = new Wick.Clip();
                project.activeFrame.addClip(clip);

                clip.addScript('load', 'this.gotoAndStop(5)');
                clip.activeFrame.end = 10;

                project.tick();
                project.tick();

                expect(clip.timeline.playheadPosition).to.equal(5);

                project.tick();

                expect(clip.timeline.playheadPosition).to.equal(5);
            });

            it('this.gotoAndStop (frame name) should work as expected', function() {
                var project = new Wick.Project();

                var clip = new Wick.Clip();
                project.activeFrame.addClip(clip);

                clip.addScript('load', 'this.gotoAndStop("foo")');
                clip.activeFrame.end = 5;

                var namedFrame = new Wick.Frame({start:6,end:10});
                namedFrame.identifier = 'foo';
                clip.activeLayer.addFrame(namedFrame);

                project.tick();
                project.tick();

                expect(clip.timeline.playheadPosition).to.equal(6);
            });

            it('gotoAndStop (frame number) should work as expected', function() {
                var project = new Wick.Project();

                var clip = new Wick.Clip();
                project.activeFrame.addClip(clip);
                project.activeFrame.end = 10;

                clip.addScript('load', 'gotoAndStop(9);');

                project.tick();
                project.tick();

                expect(project.root.timeline.playheadPosition).to.equal(9);

                project.tick();

                expect(project.root.timeline.playheadPosition).to.equal(9);
            });
        });

        describe('#gotoAndPlay', function () {
            it('this.gotoAndPlay (frame number) should work as expected', function() {
                var project = new Wick.Project();
                project.root.timeline._playing = false;

                var clip = new Wick.Clip();
                project.activeFrame.addClip(clip);

                clip.addScript('load', 'this.gotoAndPlay(5)');
                clip.activeFrame.end = 10;

                project.tick();
                project.tick();

                expect(clip.timeline.playheadPosition).to.equal(5);

                project.tick();

                expect(clip.timeline.playheadPosition).to.equal(6);
            });

            it('gotoAndPlay (frame number) should work as expected', function() {
                var project = new Wick.Project();

                var clip = new Wick.Clip();
                project.activeFrame.addClip(clip);
                project.activeFrame.end = 10;

                clip.addScript('load', 'gotoAndPlay(9)');

                project.tick();
                project.tick();

                expect(project.root.timeline.playheadPosition).to.equal(9);

                project.tick();

                expect(project.root.timeline.playheadPosition).to.equal(10);
            });
        });

        describe('#gotoNextFrame', function () {
            it('gotoNextFrame should work as expected', function () {
                var project = new Wick.Project();
                project.root.timeline._playing = false;
                project.activeFrame.end = 10;

                var clip = new Wick.Clip();
                project.activeFrame.addClip(clip);

                clip.addScript('load', 'gotoNextFrame()');

                project.tick();
                project.tick();

                expect(project.root.timeline.playheadPosition).to.equal(2);

                project.tick();

                expect(project.root.timeline.playheadPosition).to.equal(2);
            });

            it('this.gotoNextFrame should work as expected', function () {
                // TODO
            });
        });

        describe('#gotoPrevFrame', function () {
            it('gotoPrevFrame should work as expected', function () {
                var project = new Wick.Project();
                project.activeFrame.end = 10;
                project.root.timeline._playing = false;
                project.root.timeline.playheadPosition = 5;

                var clip = new Wick.Clip();
                project.activeFrame.addClip(clip);

                clip.addScript('load', 'gotoPrevFrame()');

                project.tick();
                project.tick();

                expect(project.root.timeline.playheadPosition).to.equal(4);

                project.tick();

                expect(project.root.timeline.playheadPosition).to.equal(4);
            });

            it('this.gotoPrevFrame should work as expected', function () {
                //TODO
            });
        });

        describe('#x', function () {
            it('should update x correctly', function() {
                var project = new Wick.Project();

                var clip = new Wick.Clip();
                project.addObject(clip);

                clip.addScript('load', 'this.x = 100;');
                clip.addScript('update', 'this.x += 5;');

                var error = project.tick();
                expect(error).to.equal(null);
                expect(clip.transformation.x).to.equal(100);

                error = project.tick();
                expect(error).to.equal(null);
                expect(clip.transformation.x).to.equal(105);

                error = project.tick();
                expect(error).to.equal(null);
                expect(clip.transformation.x).to.equal(110);
            });

            it('(bug) object should be recovered after project is stopped if x/y is set to undefined', function(done) {
                var project = new Wick.Project();
                project.framerate = 60;

                var clip = new Wick.Clip();
                project.addObject(clip);
                clip.x = 200;
                clip.y = 100;
                clip.addScript('load', 'this.x = undefined;this.y = undefined;');

                project.play({
                    onAfterTick: () => {
                        project.stop();
                        expect(clip.x).to.equal(200);
                        expect(clip.y).to.equal(100);
                        done();
                    }
                });
            });

            it('(bug) object should be recovered after project is stopped if x/y is set to null', function(done) {
                var project = new Wick.Project();
                project.framerate = 60;

                var clip = new Wick.Clip();
                project.addObject(clip);
                clip.x = 200;
                clip.y = 100;
                clip.addScript('load', 'this.x = null;this.y = null;');

                project.play({
                    onAfterTick: error => {
                        project.stop();
                        expect(clip.x).to.equal(200);
                        expect(clip.y).to.equal(100);
                        done();
                    }
                });
            });
        });

        describe('#y', function () {
            it('should update y correctly', function() {
                var project = new Wick.Project();

                var clip = new Wick.Clip();
                project.addObject(clip);

                clip.addScript('load', 'this.y = 100;');
                clip.addScript('update', 'this.y += 5;');

                var error = project.tick();
                expect(error).to.equal(null);
                expect(clip.transformation.y).to.equal(100);

                error = project.tick();
                expect(error).to.equal(null);
                expect(clip.transformation.y).to.equal(105);

                error = project.tick();
                expect(error).to.equal(null);
                expect(clip.transformation.y).to.equal(110);
            });
        });

        describe('#scaleX', function () {
            it('should update scaleX correctly', function() {
                var project = new Wick.Project();

                var clip = new Wick.Clip();
                project.addObject(clip);

                clip.addScript('load', 'this.scaleX = 2;');
                clip.addScript('update', 'this.scaleX += 0.1;');

                var error = project.tick();
                expect(error).to.equal(null);
                expect(clip.transformation.scaleX).to.equal(2);

                error = project.tick();
                expect(error).to.equal(null);
                expect(clip.transformation.scaleX).to.equal(2.1);

                error = project.tick();
                expect(error).to.equal(null);
                expect(clip.transformation.scaleX).to.equal(2.2);
            });
        });

        describe('#scaleY', function () {
            it('should update scaleY correctly', function() {
                var project = new Wick.Project();

                var clip = new Wick.Clip();
                project.addObject(clip);

                clip.addScript('load', 'this.scaleY = 2;');
                clip.addScript('update', 'this.scaleY += 0.1;');

                var error = project.tick();
                expect(error).to.equal(null);
                expect(clip.transformation.scaleY).to.equal(2);

                error = project.tick();
                expect(error).to.equal(null);
                expect(clip.transformation.scaleY).to.equal(2.1);

                error = project.tick();
                expect(error).to.equal(null);
                expect(clip.transformation.scaleY).to.equal(2.2);
            });
        });

        describe('#width', function () {
            it('should update width correctly', function(done) {
                var project = new Wick.Project();

                var clip = new Wick.Clip();
                clip.activeFrame.addPath(TestUtils.paperToWickPath(new paper.Path.Rectangle({
                    from: new paper.Point(0,0),
                    to: new paper.Point(50,50),
                    fillColor: 'red',
                })));
                project.activeFrame.addClip(clip);

                project.play({
                    onBeforeTick: () => {
                        project.view.render();
                    },
                    onAfterTick: () => {
                        expect(clip.width).to.equal(50);
                        clip.width = 25;
                        expect(clip.width).to.equal(25);
                        expect(clip.scaleX).to.equal(0.5);
                        clip.width = 25;
                        expect(clip.width).to.equal(25);
                        expect(clip.scaleX).to.equal(0.5);
                        clip.width = 100;
                        expect(clip.width).to.equal(100);
                        expect(clip.scaleX).to.equal(2);
                        project.stop();
                        done();
                    }
                });
            });

            it('should prevent setting width to zero', function() {
                var project = new Wick.Project();

                var clip = new Wick.Clip();
                clip.activeFrame.addPath(TestUtils.paperToWickPath(new paper.Path.Rectangle({
                    from: new paper.Point(0,0),
                    to: new paper.Point(50,50),
                    fillColor: 'red',
                })));
                project.activeFrame.addClip(clip);
                clip.view.render();// This is needed for now, as width/height are calculated in the view

                console.log(clip.width)
                clip.width = 100;
                expect(clip.width).to.equal(100);
                clip.width = 0;
                expect(clip.width).to.equal(100); // Width should not be changed to zero
            });
        });

        describe('#height', function () {
            it('should update width correctly', function(done) {
                var project = new Wick.Project();

                var clip = new Wick.Clip();
                clip.activeFrame.addPath(TestUtils.paperToWickPath(new paper.Path.Rectangle({
                    from: new paper.Point(0,0),
                    to: new paper.Point(50,50),
                    fillColor: 'red',
                })));
                project.activeFrame.addClip(clip);

                project.play({
                    onBeforeTick: () => {
                        project.view.render();
                    },
                    onAfterTick: () => {
                        expect(clip.height).to.equal(50);
                        clip.height = 25;
                        expect(clip.height).to.equal(25);
                        expect(clip.scaleY).to.equal(0.5);
                        clip.height = 25;
                        expect(clip.height).to.equal(25);
                        expect(clip.scaleY).to.equal(0.5);
                        clip.height = 100;
                        expect(clip.height).to.equal(100);
                        expect(clip.scaleY).to.equal(2);
                        project.stop();
                        done();
                    }
                });
            });
        });

        describe('#rotation', function () {
            it('should update rotation correctly', function() {
                var project = new Wick.Project();

                var clip = new Wick.Clip();
                project.addObject(clip);

                clip.addScript('load', 'this.rotation = 180;');
                clip.addScript('update', 'this.rotation += 90;');

                var error = project.tick();
                expect(error).to.equal(null);
                expect(clip.transformation.rotation).to.equal(180);

                error = project.tick();
                expect(error).to.equal(null);
                expect(clip.transformation.rotation).to.equal(270);

                error = project.tick();
                expect(error).to.equal(null);
                expect(clip.transformation.rotation).to.equal(360);

                error = project.tick();
                expect(error).to.equal(null);
                expect(clip.transformation.rotation).to.equal(450);
            });
        });

        describe('#opacity', function () {
            it('should update opacity correctly', function() {
                var project = new Wick.Project();

                var clip = new Wick.Clip();
                project.addObject(clip);

                clip.addScript('load', 'this.opacity = 0.5;');
                clip.addScript('update', 'this.opacity += 0.25;');

                var error = project.tick();
                expect(error).to.equal(null);
                expect(clip.transformation.opacity).to.equal(0.5);

                error = project.tick();
                expect(error).to.equal(null);
                expect(clip.transformation.opacity).to.equal(0.75);

                error = project.tick();
                expect(error).to.equal(null);
                expect(clip.transformation.opacity).to.equal(1);

                error = project.tick();
                expect(error).to.equal(null);
                expect(clip.transformation.opacity).to.equal(1);

                clip.updateScript('update', 'this.opacity -= 0.25;');

                error = project.tick();
                expect(error).to.equal(null);
                expect(clip.transformation.opacity).to.equal(0.75);

                error = project.tick();
                expect(error).to.equal(null);
                expect(clip.transformation.opacity).to.equal(0.5);

                error = project.tick();
                expect(error).to.equal(null);
                expect(clip.transformation.opacity).to.equal(0.25);

                error = project.tick();
                expect(error).to.equal(null);
                expect(clip.transformation.opacity).to.equal(0);

                error = project.tick();
                expect(error).to.equal(null);
                expect(clip.transformation.opacity).to.equal(0);
            });
        });

        describe('#project', function () {
            it('project should work as expected', function() {
                var project = new Wick.Project();

                var clip = new Wick.Clip();
                project.activeFrame.addClip(clip);

                clip.addScript('load', 'this.__project = project');
                var error = project.tick();
                expect(error).to.equal(null);
                expect(clip.__project).to.equal(project.root);
                expect(clip.__project.resolution.x).to.equal(project.width);
                expect(clip.__project.resolution.y).to.equal(project.height);
                expect(clip.__project.framerate).to.equal(project.framerate);
                expect(clip.__project.backgroundColor.hex).to.equal('#ffffff');
            });
        });

        describe('#parent', function () {
            it('parent should work as expected', function() {
                var project = new Wick.Project();

                var clip = new Wick.Clip();
                project.activeFrame.addClip(clip);

                clip.addScript('load', 'this.__parent = parent');
                var error = project.tick();
                expect(error).to.equal(null);
                expect(clip.__parent).to.equal(clip.parentClip);
            });
        });

        describe('#random', function () {
            it('random API should work correctly', function() {
                var numTries = 10;
                for (let i=0; i<numTries; i++) {
                    var project = new Wick.Project();

                    var clip = new Wick.Clip();
                    project.activeFrame.addClip(clip);

                    clip.addScript('load', 'this.__randomResult = random.integer(5,10);');
                    var error = project.tick();
                    expect(error).to.equal(null);
                    expect(typeof clip.__randomResult).to.equal("number");
                    expect(clip.__randomResult >= 5).to.equal(true);
                    expect(clip.__randomResult <= 10).to.equal(true);
                }
            });
        });

        describe('#currentFrameName', function () {
            it ('clips should return current frame name', function () {
                var project = new Wick.Project();

                var clip = new Wick.Clip();
                project.activeFrame.addClip(clip);

                clip.addScript('load', 'this.__frameName = this.currentFrameName;');
                clip.addScript('update', 'this.__frameName = this.currentFrameName;');
                var error = project.tick();
                expect(error).to.equal(null);
                expect(clip.__frameName).to.equal('');
                clip.timeline.activeFrame.identifier = "Tester";

                error = project.tick();
                expect(clip.__frameName).to.equal("Tester");
            });
        })

        describe('#currentFrameNumber', function () {
            it ('clips should return current frame number', function () {
                var project = new Wick.Project();

                var clip = new Wick.Clip();
                var clip2 = new Wick.Clip();
                clip2.timeline.activeLayer.addFrame(new Wick.Frame({start:2}));

                project.activeFrame.addClip(clip);
                project.activeFrame.addClip(clip2);

                clip.addScript('load', 'this.__frameNumber = this.currentFrameNumber;');
                clip.addScript('update', 'this.__frameNumber = this.currentFrameNumber;');

                clip2.addScript('load', 'this.__frameNumber = this.currentFrameNumber;');
                clip2.addScript('update', 'this.__frameNumber = this.currentFrameNumber;');

                var error = project.tick();
                expect(error).to.equal(null);

                expect(clip.__frameNumber).to.equal(1);
                expect(clip2.__frameNumber).to.equal(1);
                error = project.tick();
                expect(error).to.equal(null);
                expect(clip.__frameNumber).to.equal(1);
                expect(clip2.__frameNumber).to.equal(2);
            });
        });

        describe('#clone/clones', function () {
            it ('clone() and clones list should work correctly', function () {
                var project = new Wick.Project();

                var original = new Wick.Clip({identifier: 'original'});
                project.activeFrame.addClip(original);

                original.addScript('default', 'this.__cloneOfMyself = this.clone(); this.__cloneFromCloneArray = this.clones[0];');

                var error = project.tick();
                expect(error).to.equal(null);

                // Was the clone successful?
                expect(original.isClone).to.equal(false);
                expect(original.__cloneOfMyself instanceof Wick.Clip).to.equal(true);
                expect(original.__cloneOfMyself.identifier).to.equal(null);
                expect(original.__cloneOfMyself.isClone).to.equal(true);
                expect(original.__cloneOfMyself.uuid).to.not.equal(undefined);
                expect(original.__cloneOfMyself.uuid).to.not.equal(original.uuid);

                // Is the clone accessible through the 'clones' API?
                expect(original.__cloneFromCloneArray).to.equal(original.__cloneOfMyself);

                // Was the clone added to the same frame as the original clip?
                expect(project.activeFrame.clips.length).to.equal(2);
                expect(project.activeFrame.clips[0]).to.equal(original);
                expect(project.activeFrame.clips[1]).to.equal(original.__cloneOfMyself);
            });

            it ('clone() and clones list should work with multiple clones correctly', function () {
                var project = new Wick.Project();

                var original = new Wick.Clip({identifier: 'original'});
                project.activeFrame.addClip(original);

                original.addScript('default', 'this.__clone1 = this.clone(); this.__clone2 = this.clone(); this.__clone3 = this.clone();');

                var error = project.tick();
                expect(error).to.equal(null);

                // Were the clones successful?
                expect(original.__clone1 instanceof Wick.Clip).to.equal(true);
                expect(original.__clone1.identifier).to.equal(null);
                expect(original.__clone1.uuid).to.not.equal(undefined);
                expect(original.__clone1.uuid).to.not.equal(original.uuid);

                expect(original.__clone2 instanceof Wick.Clip).to.equal(true);
                expect(original.__clone2.identifier).to.equal(null);
                expect(original.__clone2.uuid).to.not.equal(undefined);
                expect(original.__clone2.uuid).to.not.equal(original.uuid);

                expect(original.__clone3 instanceof Wick.Clip).to.equal(true);
                expect(original.__clone3.identifier).to.equal(null);
                expect(original.__clone3.uuid).to.not.equal(undefined);
                expect(original.__clone3.uuid).to.not.equal(original.uuid);

                // Are the clones accessible through the 'clones' API?
                expect(original.clones[0]).to.equal(original.__clone1);
                expect(original.clones[1]).to.equal(original.__clone2);
                expect(original.clones[2]).to.equal(original.__clone3);

                // Were the clones added to the same frame as the original clip?
                expect(project.activeFrame.clips.length).to.equal(4);
                expect(project.activeFrame.clips[0]).to.equal(original);
                expect(project.activeFrame.clips[1]).to.equal(original.__clone1);
                expect(project.activeFrame.clips[2]).to.equal(original.__clone2);
                expect(project.activeFrame.clips[3]).to.equal(original.__clone3);
            });
        })

        it('clips should have access to global API', function() {
            var project = new Wick.Project();

            var clip = new Wick.Clip();
            project.activeFrame.addClip(clip);

            clip.addScript('load', 'stop(); play();');
            project.tick();
            expect(project.error).to.equal(null);
        });

        it('clips should have access to other named objects', function() {
            var project = new Wick.Project();

            var clipA = new Wick.Clip({identifier: 'clipA'});
            project.activeFrame.addClip(clipA);

            var clipB = new Wick.Clip({identifier: 'clipB'});
            project.activeFrame.addClip(clipB);

            var clipC = new Wick.Clip();
            project.activeFrame.addClip(clipC);

            var clipD = new Wick.Clip({identifier: 'clipD'});
            clipB.activeFrame.addClip(clipD);

            var dynamicText = TestUtils.paperToWickPath(new paper.PointText({
                fontFamily: 'Helvetica',
                fontSize: 24,
                content: 'This is dynamic text',
            }));
            dynamicText.identifier = 'dynamicText';
            project.activeFrame.addPath(dynamicText);

            clipA.addScript('default', 'this.__clipA = clipA; this.__clipB = clipB; this.__clipD = clipB.clipD; this.__dynamicText = dynamicText');
            clipB.addScript('default', 'this.__clipA = clipA; this.__clipB = clipB; this.__clipD = clipB.clipD; this.__dynamicText = dynamicText');
            clipC.addScript('default', 'this.__clipA = clipA; this.__clipB = clipB; this.__clipD = clipB.clipD; this.__dynamicText = dynamicText');

            project.tick();

            expect(clipA.__clipA).to.equal(clipA);
            expect(clipA.__clipB).to.equal(clipB);
            expect(clipA.__clipD).to.equal(clipD);
            expect(clipA.__dynamicText).to.equal(dynamicText);

            expect(clipB.__clipA).to.equal(clipA);
            expect(clipB.__clipB).to.equal(clipB);
            expect(clipB.__clipD).to.equal(clipD);
            expect(clipB.__dynamicText).to.equal(dynamicText);

            expect(clipC.__clipA).to.equal(clipA);
            expect(clipC.__clipB).to.equal(clipB);
            expect(clipC.__clipD).to.equal(clipD);
            expect(clipC.__dynamicText).to.equal(dynamicText);
        });

        it('clips should not have access to other named objects on other frames', function() {
            var project = new Wick.Project();
            project.root.timeline.activeLayer.addFrame(new Wick.Frame({start:2}));

            var clipA = new Wick.Clip();
            clipA.identifier = 'foo';
            project.activeLayer.frames[0].addClip(clipA);

            var clipB = new Wick.Clip();
            clipB.identifier = 'bar';
            project.activeLayer.frames[1].addClip(clipB);

            clipA.addScript('load', 'this.__bar = bar;');
            var errorA = project.tick();
            expect(errorA).not.to.equal(null);
            expect(errorA.message).to.equal("bar is not defined");
        });

        it('clips should have access to named clips on their own timelines', function() {
            var project = new Wick.Project();
            var clip = new Wick.Clip();
            project.activeFrame.addClip(clip);

            clip.timeline.addLayer(new Wick.Layer());
            clip.timeline.activeLayer.addFrame(new Wick.Frame({start:1}));
            clip.timeline.activeLayer.addFrame(new Wick.Frame({start:2}));

            // Add these ones to the active frame
            var subclipA = new Wick.Clip();
            subclipA.identifier = 'foo';

            var subclipB = new Wick.Clip();
            subclipB.identifier = 'bar';

            clip.timeline.frames[0].addClip(subclipA);
            clip.timeline.frames[0].addClip(subclipB);

            // Add this one to the inactive frame
            var subclipC = new Wick.Clip();
            subclipC.identifier = 'baz';

            clip.timeline.frames[1].addClip(subclipC);

            clip.addScript('load', 'this.__fooRef = this.foo; this.__barRef = this.bar;');
            var noError = project.tick();
            expect(noError).to.equal(null);
            expect(clip.__fooRef).to.equal(subclipA);
            expect(clip.__barRef).to.equal(subclipB);

            clip.addScript('load', 'this.__bazRef = this.baz;');
            var error = project.tick();
            expect(error).to.equal(null);
            expect(clip.__bazRef).to.equal(undefined);
        });

        it('clips should have access to named clips on other timelines', function() {
            var project = new Wick.Project();
            var clip = new Wick.Clip();
            project.activeFrame.addClip(clip);

            var clipWithChildren = new Wick.Clip();
            project.activeFrame.addClip(clipWithChildren);
            clipWithChildren.identifier = 'otherClip';
            clipWithChildren.timeline.addLayer(new Wick.Layer());
            clipWithChildren.timeline.activeLayer.addFrame(new Wick.Frame({start:1}));
            clipWithChildren.timeline.activeLayer.addFrame(new Wick.Frame({start:2}));

            var subclipA = new Wick.Clip();
            subclipA.identifier = 'foo';

            var subclipB = new Wick.Clip();
            subclipB.identifier = 'bar';

            clipWithChildren.timeline.frames[0].addClip(subclipA);
            clipWithChildren.timeline.frames[0].addClip(subclipB);

            clip.addScript('load', 'this.__fooRef = otherClip.foo; this.__barRef = otherClip.bar;');
            var noError = project.tick();
            expect(noError).to.equal(null);
            expect(clip.__fooRef).to.equal(subclipA);
            expect(clip.__barRef).to.equal(subclipB);
        });

        describe('#setText', function() {
            it('should update the textContent of a dynamic text path', function () {
                var project = new Wick.Project();

                var dynamicText = TestUtils.paperToWickPath(new paper.PointText({
                    content: 'foo'
                }));
                dynamicText.identifier = 'dynamicText';
                project.activeFrame.addPath(dynamicText);

                project.activeFrame.addScript('default', 'dynamicText.setText("bar");dynamicText.__newText = dynamicText.textContent');

                expect(project.tick()).to.equal(null);

                expect(dynamicText.__newText).to.equal('bar');
            });

            it('should throw an error if used on a Clip', function () {
                var project = new Wick.Project();

                var clip = new Wick.Clip();
                clip.identifier = 'testclip';
                project.activeFrame.addClip(clip);

                project.activeFrame.addScript('default', 'testclip.setText("Foo")');

                expect(project.tick().message).to.equal("setText() can only be used with text objects.");
            });
        });

        describe('#hitTest', function() {
            it('should work with two basic clips (not touching)', function (done) {
                var project = new Wick.Project();

                var clip1 = new Wick.Clip({identifier: 'clip1'});
                clip1.activeFrame.addPath(TestUtils.paperToWickPath(new paper.Path.Rectangle({
                    from: new paper.Point(-50,-50),
                    to: new paper.Point(50,50),
                    fillColor: 'red',
                })));
                clip1.transformation.x = 50;

                var clip2 = new Wick.Clip({identifier: 'clip2'});
                clip2.activeFrame.addPath(TestUtils.paperToWickPath(new paper.Path.Rectangle({
                    from: new paper.Point(-50,-50),
                    to: new paper.Point(50,50),
                    fillColor: 'red',
                })));
                clip2.transformation.x = 150;

                project.activeFrame.addClip(clip1);
                project.activeFrame.addClip(clip2);

                clip1.addScript('load', 'this.__hits = this.hitTest(clip2)');

                project.play({
                    onBeforeTick: () => {
                        project.view.render();
                    },
                    onAfterTick: () => {
                        expect(clip1.__hits).to.equal(false);
                        project.stop();
                        done();
                    }
                });
            });

            it('should work with two basic clips (touching)', function (done) {
                var project = new Wick.Project();

                var clip1 = new Wick.Clip({identifier: 'clip1'});
                clip1.activeFrame.addPath(TestUtils.paperToWickPath(new paper.Path.Rectangle({
                    from: new paper.Point(-50,-50),
                    to: new paper.Point(50,50),
                    fillColor: 'red',
                })));
                clip1.transformation.x = 50;

                var clip2 = new Wick.Clip({identifier: 'clip2'});
                clip2.activeFrame.addPath(TestUtils.paperToWickPath(new paper.Path.Rectangle({
                    from: new paper.Point(-50,-50),
                    to: new paper.Point(50,50),
                    fillColor: 'red',
                })));
                clip2.transformation.x = 100;

                project.activeFrame.addClip(clip1);
                project.activeFrame.addClip(clip2);

                clip1.addScript('load', 'this.__hits = this.hitTest(clip2)');

                project.play({
                    onBeforeTick: () => {
                        project.view.render();
                    },
                    onAfterTick: () => {
                        expect(clip1.__hits).to.equal(true);
                        project.stop();
                        done();
                    }
                });
            });
        });

        describe('#remove', function() {
            it('should only be removed once', function (done) {
                var project = new Wick.Project();

                var clip1 = new Wick.Clip({identifier: 'clip1'});

                clip1.remove();
                clip1.remove();

                expect(clip1.parent).to.equal(null);
                done();
            });
        });
    });

    describe('#animationType', function () {
        it('should have the correct animation type', function () {
            let clip = new Wick.Clip();

            expect(clip.animationType).to.equal('loop');

            clip.animationType = 'single';
            expect(clip.animationType).to.equal('single');

            clip.animationType = 'playOnce';
            expect(clip.animationType).to.equal('playOnce');

            clip.animationType = 'randomAnimationTypeThatIsNotReal';
            expect(clip.animationType).to.equal('loop');
        });

        it('should have the correct singleFrame number', function () {
            let clip = new Wick.Clip();
            expect(clip.animationType).to.equal('loop');
            expect(clip.singleFrameNumber).to.equal(null);

            clip.animationType = 'single';
            expect(clip.animationType).to.equal('single');
            expect(clip.singleFrameNumber).to.equal(1);

            clip.singleFrameNumber = 2; // This clip does not have 2 frames, this is illegal
            expect(clip.singleFrameNumber).to.equal(1);

            clip.singleFrameNumber = -1; // Cannot set a clip to show a frame that can't exist. i.e. below 1.
            expect(clip.singleFrameNumber).to.equal(1);

            let frame = new Wick.Frame({start: 2});
            clip.timeline.addFrame(frame);

            clip.singleFrameNumber = 2;
            expect(clip.singleFrameNumber).to.equal(2);
        });

        it ('should animate correctly as a looped clip', function () {

        });

        it ('should animate correctly as a single frame clip', function () {

        });

        it ('should animate correctly as a playOnce clip', function () {

        });

        it ('should maintain animationType state when copied', function () {

        });

        it ('should maintain animationType state when loaded from a save file', function () {

        });

        it ('should display the correct frame when in single frame mode', function () {

        });

        it ('should display the correct frame when in single frame mode and loaded from a save file', function () {

        });
    });

    describe('#isRoot', function() {
        it('isRoot should work', function () {
            var project = new Wick.Project();

            var clip = new Wick.Clip({identifier: 'clip1'});
            project.activeFrame.addClip(clip);

            expect(project.root.isRoot).to.equal(true);
            expect(clip.isRoot).to.equal(false);
        });
    });

    describe('#isRoot', function() {
        it('isFocus should work', function () {
            var project = new Wick.Project();

            var clip = new Wick.Clip({identifier: 'clip1'});
            project.activeFrame.addClip(clip);

            expect(project.root.isFocus).to.equal(true);
            expect(clip.isFocus).to.equal(false);

            project.focus = clip;

            expect(project.root.isFocus).to.equal(false);
            expect(clip.isFocus).to.equal(true);
        });
    });
});
