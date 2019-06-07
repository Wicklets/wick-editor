describe('Wick.Clipboard', function() {
    it('should copy and paste objects (to other frame) correctly', function () {
        localStorage.clear();

        var project = new Wick.Project();

        var path1 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(50,50),
            radius: 25,
            fillColor: 'red',
        }));
        var path2 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(50,50),
            radius: 25,
            fillColor: 'blue',
        }));

        project.activeFrame.addPath(path1);
        project.activeFrame.addPath(path2);

        // Make sure we're testing for path json with wick data
        project.view.render();
        project.view.applyChanges();

        // Nothing should happen yet:
        expect(project.copySelectionToClipboard()).to.equal(false);
        expect(project.pasteClipboardContents()).to.equal(false);

        project.selection.select(path1);
        expect(project.copySelectionToClipboard()).to.equal(true);
        expect(project.activeFrame.paths.length).to.equal(2);
        expect(project.activeFrame.paths[0].uuid).to.equal(path1.uuid);
        expect(project.activeFrame.paths[1].uuid).to.equal(path2.uuid);

        // Move playhead to new frame, then paste
        project.activeLayer.addFrame(new Wick.Frame({start: 2}));
        project.focus.timeline.playheadPosition = 2;
        project.view.render();

        // Paste and check that everything is OK.
        expect(project.pasteClipboardContents()).to.equal(true);
        expect(project.activeLayer.frames[0].paths.length).to.equal(2);
        expect(project.activeLayer.frames[0].paths[0].uuid).to.equal(path1.uuid);
        expect(project.activeLayer.frames[0].paths[1].uuid).to.equal(path2.uuid);
        expect(project.activeFrame.paths.length).to.equal(1);
        expect(project.activeFrame.paths[0].uuid).to.not.equal(path1.uuid);
        expect(project.activeFrame.paths[0].uuid).to.not.equal(path2.uuid);
        expect(project.selection.getSelectedObject().uuid).to.not.equal(path1.uuid);
        expect(project.selection.getSelectedObject().uuid).to.not.equal(path2.uuid);
        expect(project.selection.getSelectedObject().uuid).to.equal(project.activeFrame.paths[0].uuid);

        // Original paths should NOT have moved.
        expect(project.activeLayer.frames[0].paths[0].x).to.equal(50);
        expect(project.activeLayer.frames[0].paths[0].y).to.equal(50);
        expect(project.activeLayer.frames[0].paths[1].x).to.equal(50);
        expect(project.activeLayer.frames[0].paths[1].y).to.equal(50);
        // Pasted path should NOT BE OFFSET.
        expect(project.activeFrame.paths[0].x).to.equal(50);
        expect(project.activeFrame.paths[0].y).to.equal(50);
    });

    it('should copy and paste objects to same frame (offset) correctly', function () {
        localStorage.clear();

        var project = new Wick.Project();

        var path1 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(50,50),
            radius: 25,
            fillColor: 'red',
        }));
        var path2 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(50,50),
            radius: 25,
            fillColor: 'blue',
        }));

        project.activeFrame.addPath(path1);
        project.activeFrame.addPath(path2);

        // Make sure we're testing for path json with wick data
        project.view.render();
        project.view.applyChanges();

        // Nothing should happen yet:
        expect(project.copySelectionToClipboard()).to.equal(false);
        expect(project.pasteClipboardContents()).to.equal(false);

        // Select path1 and copy it to clipboard
        project.selection.select(path1);
        expect(project.copySelectionToClipboard()).to.equal(true);
        expect(project.activeFrame.paths.length).to.equal(2);
        expect(project.activeFrame.paths[0].uuid).to.equal(path1.uuid);
        expect(project.activeFrame.paths[1].uuid).to.equal(path2.uuid);

        // paste path1!
        expect(project.pasteClipboardContents()).to.equal(true);
        expect(project.activeFrame.paths.length).to.equal(3);
        expect(project.activeFrame.paths[0].uuid).to.equal(path1.uuid);
        expect(project.activeFrame.paths[1].uuid).to.equal(path2.uuid);
        expect(project.activeFrame.paths[2].uuid).to.not.equal(path1.uuid);
        expect(project.activeFrame.paths[2].uuid).to.not.equal(path2.uuid);
        expect(project.selection.getSelectedObject().uuid).to.not.equal(path1.uuid);
        expect(project.selection.getSelectedObject().uuid).to.not.equal(path2.uuid);
        expect(project.selection.getSelectedObject().uuid).to.equal(project.activeFrame.paths[2].uuid);

        expect(project.activeFrame.paths[0].x).to.equal(50);
        expect(project.activeFrame.paths[0].y).to.equal(50);
        expect(project.activeFrame.paths[1].x).to.equal(50);
        expect(project.activeFrame.paths[1].y).to.equal(50);
        expect(project.activeFrame.paths[2].x).to.equal(50 + Wick.Clipboard.PASTE_OFFSET);
        expect(project.activeFrame.paths[2].y).to.equal(50 + Wick.Clipboard.PASTE_OFFSET);
    });

    it('should copy and paste objects to different project correctly', function () {
        localStorage.clear();

        var project = new Wick.Project();

        var path1 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(50,50),
            radius: 25,
            fillColor: 'red',
        }));
        var path2 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(50,50),
            radius: 25,
            fillColor: 'blue',
        }));

        project.activeFrame.addPath(path1);
        project.activeFrame.addPath(path2);

        // Make sure we're testing for path json with wick data
        project.view.render();
        project.view.applyChanges();

        // Nothing should happen yet:
        expect(project.copySelectionToClipboard()).to.equal(false);
        expect(project.pasteClipboardContents()).to.equal(false);

        // Select path1 and copy it to clipboard
        project.selection.select(path1);
        expect(project.copySelectionToClipboard()).to.equal(true);
        expect(project.activeFrame.paths.length).to.equal(2);
        expect(project.activeFrame.paths[0].uuid).to.equal(path1.uuid);
        expect(project.activeFrame.paths[1].uuid).to.equal(path2.uuid);

        var otherProject = new Wick.Project();

        // paste path1 into a different project!
        expect(otherProject.pasteClipboardContents()).to.equal(true);
        expect(otherProject.activeFrame.paths.length).to.equal(1);
        expect(otherProject.selection.getSelectedObject().uuid).to.equal(otherProject.activeFrame.paths[0].uuid);

        expect(otherProject.activeFrame.paths[0].x).to.equal(50);
        expect(otherProject.activeFrame.paths[0].y).to.equal(50);
    });

    it('should copy and paste image paths to a different project correctly', function (done) {
        var project = new Wick.Project();

        var imageAsset = new Wick.ImageAsset({
            filename: 'foo.png',
            src: TestUtils.TEST_IMG_SRC_PNG,
        });
        project.addAsset(imageAsset);

        Wick.Path.createImagePath(imageAsset, path => {
            // Select the path and copy it
            project.activeFrame.addPath(path);
            project.selection.select(path);
            expect(project.copySelectionToClipboard()).to.equal(true);

            // paste the frame into a different project!
            // it should import the sound into the other project automagically.
            Wick.ObjectCache.clear();
            Wick.FileCache.clear();
            var otherProject = new Wick.Project();

            expect(otherProject.pasteClipboardContents()).to.equal(true);
            expect(otherProject.activeFrame.paths.length).to.equal(1);
            expect(otherProject.getAssets().length).to.equal(1);
            expect(otherProject.getAssets()[0].uuid).to.equal(project.getAssets()[0].uuid);
            expect(otherProject.getAssets()[0].src).to.equal(TestUtils.TEST_IMG_SRC_PNG);
            expect(otherProject.activeFrame.paths[0].json[1].source).to.equal('asset:' + otherProject.getAssets()[0].uuid);

            done();
        });
    });

    it('should copy and paste frames with sounds to a different project correctly', function () {
        localStorage.clear();

        var project = new Wick.Project();
        var frame = new Wick.Frame({start: 2});
        project.activeLayer.addFrame(frame);

        // Add a sound to the frame:
        var soundAsset = new Wick.SoundAsset({
            filename: 'test.wav',
            src: TestUtils.TEST_SOUND_SRC_WAV,
        });
        project.addAsset(soundAsset);
        frame.sound = soundAsset;

        // Select the frame and copy it to the clipboard
        project.selection.select(frame);
        expect(project.copySelectionToClipboard()).to.equal(true);

        // paste the frame into a different project!
        // it should import the sound into the other project automagically.
        Wick.ObjectCache.clear();
        Wick.FileCache.clear();
        var otherProject = new Wick.Project();

        otherProject.focus.timeline.playheadPosition = 2;
        expect(otherProject.pasteClipboardContents()).to.equal(true);
        expect(otherProject.activeLayer.frames.length).to.equal(2);
        expect(otherProject.getAssets().length).to.equal(1);
        expect(otherProject.getAssets()[0].uuid).to.equal(project.getAssets()[0].uuid);
        expect(otherProject.getAssets()[0].src).to.equal(TestUtils.TEST_SOUND_SRC_WAV);
        expect(otherProject.activeLayer.frames[1].sound).to.equal(otherProject.getAssets()[0]);
    });

    it('should copy and paste clips with children with asset links to a different project correctly', function () {
        localStorage.clear();

        var project = new Wick.Project();
        var clip = new Wick.Clip();
        project.activeFrame.addClip(clip);

        var soundAsset = new Wick.SoundAsset({
            filename: 'test.wav',
            src: TestUtils.TEST_SOUND_SRC_WAV,
        });
        project.addAsset(soundAsset);
        clip.activeFrame.sound = soundAsset;

        // Select the clip and copy it to the clipboard
        project.selection.select(clip);
        expect(project.copySelectionToClipboard()).to.equal(true);

        // paste the frame into a different project!
        // it should import the sound into the other project automagically.
        Wick.ObjectCache.clear();
        Wick.FileCache.clear();
        var otherProject = new Wick.Project();

        expect(otherProject.pasteClipboardContents()).to.equal(true);
        expect(otherProject.getAssets().length).to.equal(1);
        expect(otherProject.getAssets()[0].uuid).to.equal(project.getAssets()[0].uuid);
        expect(otherProject.getAssets()[0].src).to.equal(TestUtils.TEST_SOUND_SRC_WAV);
        expect(otherProject.activeFrame.clips[0].activeFrame.sound.src).to.equal(TestUtils.TEST_SOUND_SRC_WAV);
    });

    it('should copy and paste frames on multiple layers correctly', function () {
        localStorage.clear();

        var project = new Wick.Project();

        var frame1 = project.activeFrame;
        var frame2 = new Wick.Frame();
        var frame3 = new Wick.Frame();

        var layer1 = project.activeLayer;
        var layer2 = new Wick.Layer();
        var layer3 = new Wick.Layer();

        layer2.addFrame(frame2);
        layer3.addFrame(frame3);

        project.activeTimeline.addLayer(layer2);
        project.activeTimeline.addLayer(layer3);

        // Select the three frames on the three layers
        project.selection.select(frame1);
        project.selection.select(frame3);
        project.selection.select(frame2);
        expect(project.copySelectionToClipboard()).to.equal(true);
        // nothing should have changed:
        expect(project.activeTimeline.frames.length).to.equal(3);
        expect(project.activeTimeline.frames[0].uuid).to.equal(frame1.uuid);
        expect(project.activeTimeline.frames[1].uuid).to.equal(frame2.uuid);
        expect(project.activeTimeline.frames[2].uuid).to.equal(frame3.uuid);
        // move playhead over to the right and paste
        project.focus.timeline.playheadPosition = 2;
        expect(project.pasteClipboardContents()).to.equal(true);
        expect(project.activeTimeline.frames.length).to.equal(6);
        expect(layer1.frames.length).to.equal(2);
        expect(layer2.frames.length).to.equal(2);
        expect(layer3.frames.length).to.equal(2);
        expect(layer1.getFrameAtPlayheadPosition(2)).to.not.equal(null);
        expect(layer2.getFrameAtPlayheadPosition(2)).to.not.equal(null);
        expect(layer3.getFrameAtPlayheadPosition(2)).to.not.equal(null);
    });

    it('should copy and paste frames to correct playhead positions', function () {
        localStorage.clear();

        var project = new Wick.Project();

        var frame1 = project.activeFrame;
        var frame2 = new Wick.Frame({start:2});
        var frame3 = new Wick.Frame({start:3});

        project.activeLayer.addFrame(frame2);
        project.activeLayer.addFrame(frame3);

        project.selection.select(frame1);
        project.selection.select(frame2);
        project.selection.select(frame3);

        project.focus.timeline.playheadPosition = 3;//copy should not be affected by the playhead
        project.copySelectionToClipboard();
        project.focus.timeline.playheadPosition = 1;
        project.pasteClipboardContents();

        expect(project.activeLayer.frames.length).to.equal(3);
        expect(project.activeLayer.getFrameAtPlayheadPosition(1)).to.not.equal(undefined);
        expect(project.activeLayer.getFrameAtPlayheadPosition(2)).to.not.equal(undefined);
        expect(project.activeLayer.getFrameAtPlayheadPosition(3)).to.not.equal(undefined);
        expect(project.activeLayer.getFrameAtPlayheadPosition(4)).to.equal(undefined);

        project.activeTimeline.playheadPosition = 4;
        project.pasteClipboardContents();

        expect(project.activeLayer.frames.length).to.equal(6);
        expect(project.activeLayer.getFrameAtPlayheadPosition(1)).to.not.equal(undefined);
        expect(project.activeLayer.getFrameAtPlayheadPosition(2)).to.not.equal(undefined);
        expect(project.activeLayer.getFrameAtPlayheadPosition(3)).to.not.equal(undefined);
        expect(project.activeLayer.getFrameAtPlayheadPosition(4)).to.not.equal(undefined);
        expect(project.activeLayer.getFrameAtPlayheadPosition(5)).to.not.equal(undefined);
        expect(project.activeLayer.getFrameAtPlayheadPosition(6)).to.not.equal(undefined);
        expect(project.activeLayer.getFrameAtPlayheadPosition(7)).equal(undefined);
    });

    it('(bug) copied objects should have new uuids', function () {
        localStorage.clear();

        var project = new Wick.Project();
        project.selection.select(project.activeFrame);

        project.copySelectionToClipboard();
        project.focus.timeline.playheadPosition = 2;
        project.pasteClipboardContents();
        project.focus.timeline.playheadPosition = 3;
        project.pasteClipboardContents();

        var frame1 = project.activeLayer.getFrameAtPlayheadPosition(1);
        var frame2 = project.activeLayer.getFrameAtPlayheadPosition(2);
        var frame3 = project.activeLayer.getFrameAtPlayheadPosition(3);
        expect(project.activeLayer.frames.length).to.equal(3);
        expect(frame1).to.not.equal(undefined);
        expect(frame2).to.not.equal(undefined);
        expect(frame3).to.not.equal(undefined);
        expect(frame1.uuid).to.not.equal(frame2.uuid);
        expect(frame2.uuid).to.not.equal(frame3.uuid);
        expect(frame1.uuid).to.not.equal(frame3.uuid);
    });

    it('should copy and paste even when there is no activeFrame', function () {
        localStorage.clear();

        var project = new Wick.Project();

        project.selection.select(project.activeFrame);

        project.focus.timeline.playheadPosition = 2;
        project.copySelectionToClipboard();
        project.pasteClipboardContents();

        expect(project.activeLayer.frames.length).to.equal(2);
        expect(project.activeLayer.getFrameAtPlayheadPosition(1)).to.not.equal(project.activeFrame);
        expect(project.activeLayer.getFrameAtPlayheadPosition(2)).to.not.equal(undefined);
    });
});
