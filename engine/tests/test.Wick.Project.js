describe('Wick.Project', function() {
    var TEST_IMAGE_SRC = 'data:image/png;base64,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';
    var TEST_SOUND_SRC = 'data:audio/wav;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeIIIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvxgxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEmS4RcfkVKOhJf+WOgoxJclFz3kgn//dBA+ya1GhurNn8zb//9NNutNuhz31f////9vt///z+IdAEAAAK4LQIAKobHItEIYCGAExBwe8jcToF9zIKrEdDYIuP2MgOWFSE34wYiR5iqQPj0JIeoVdlG4VD4XA67mAcNa1fhzA1jwHuTRxDUQ//iYBczjHiTJcIuPyKlHQkv/LHQUYkuSi57yQT//uggfZNajQ3Vmz+Zt//+mm3Wm3Q576v////+32///5/EOgAAADVghQAAAAA//uQZAUAB1WI0PZugAAAAAoQwAAAEk3nRd2qAAAAACiDgAAAAAAABCqEEQRLCgwpBGMlJkIz8jKhGvj4k6jzRnqasNKIeoh5gI7BJaC1A1AoNBjJgbyApVS4IDlZgDU5WUAxEKDNmmALHzZp0Fkz1FMTmGFl1FMEyodIavcCAUHDWrKAIA4aa2oCgILEBupZgHvAhEBcZ6joQBxS76AgccrFlczBvKLC0QI2cBoCFvfTDAo7eoOQInqDPBtvrDEZBNYN5xwNwxQRfw8ZQ5wQVLvO8OYU+mHvFLlDh05Mdg7BT6YrRPpCBznMB2r//xKJjyyOh+cImr2/4doscwD6neZjuZR4AgAABYAAAABy1xcdQtxYBYYZdifkUDgzzXaXn98Z0oi9ILU5mBjFANmRwlVJ3/6jYDAmxaiDG3/6xjQQCCKkRb/6kg/wW+kSJ5//rLobkLSiKmqP/0ikJuDaSaSf/6JiLYLEYnW/+kXg1WRVJL/9EmQ1YZIsv/6Qzwy5qk7/+tEU0nkls3/zIUMPKNX/6yZLf+kFgAfgGyLFAUwY//uQZAUABcd5UiNPVXAAAApAAAAAE0VZQKw9ISAAACgAAAAAVQIygIElVrFkBS+Jhi+EAuu+lKAkYUEIsmEAEoMeDmCETMvfSHTGkF5RWH7kz/ESHWPAq/kcCRhqBtMdokPdM7vil7RG98A2sc7zO6ZvTdM7pmOUAZTnJW+NXxqmd41dqJ6mLTXxrPpnV8avaIf5SvL7pndPvPpndJR9Kuu8fePvuiuhorgWjp7Mf/PRjxcFCPDkW31srioCExivv9lcwKEaHsf/7ow2Fl1T/9RkXgEhYElAoCLFtMArxwivDJJ+bR1HTKJdlEoTELCIqgEwVGSQ+hIm0NbK8WXcTEI0UPoa2NbG4y2K00JEWbZavJXkYaqo9CRHS55FcZTjKEk3NKoCYUnSQ0rWxrZbFKbKIhOKPZe1cJKzZSaQrIyULHDZmV5K4xySsDRKWOruanGtjLJXFEmwaIbDLX0hIPBUQPVFVkQkDoUNfSoDgQGKPekoxeGzA4DUvnn4bxzcZrtJyipKfPNy5w+9lnXwgqsiyHNeSVpemw4bWb9psYeq//uQZBoABQt4yMVxYAIAAAkQoAAAHvYpL5m6AAgAACXDAAAAD59jblTirQe9upFsmZbpMudy7Lz1X1DYsxOOSWpfPqNX2WqktK0DMvuGwlbNj44TleLPQ+Gsfb+GOWOKJoIrWb3cIMeeON6lz2umTqMXV8Mj30yWPpjoSa9ujK8SyeJP5y5mOW1D6hvLepeveEAEDo0mgCRClOEgANv3B9a6fikgUSu/DmAMATrGx7nng5p5iimPNZsfQLYB2sDLIkzRKZOHGAaUyDcpFBSLG9MCQALgAIgQs2YunOszLSAyQYPVC2YdGGeHD2dTdJk1pAHGAWDjnkcLKFymS3RQZTInzySoBwMG0QueC3gMsCEYxUqlrcxK6k1LQQcsmyYeQPdC2YfuGPASCBkcVMQQqpVJshui1tkXQJQV0OXGAZMXSOEEBRirXbVRQW7ugq7IM7rPWSZyDlM3IuNEkxzCOJ0ny2ThNkyRai1b6ev//3dzNGzNb//4uAvHT5sURcZCFcuKLhOFs8mLAAEAt4UWAAIABAAAAAB4qbHo0tIjVkUU//uQZAwABfSFz3ZqQAAAAAngwAAAE1HjMp2qAAAAACZDgAAAD5UkTE1UgZEUExqYynN1qZvqIOREEFmBcJQkwdxiFtw0qEOkGYfRDifBui9MQg4QAHAqWtAWHoCxu1Yf4VfWLPIM2mHDFsbQEVGwyqQoQcwnfHeIkNt9YnkiaS1oizycqJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=';

    //https://stackoverflow.com/questions/12168909/blob-from-dataurl
    function dataURItoBlob(dataURI) {
      // convert base64 to raw binary data held in a string
      // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
      var byteString = atob(dataURI.split(',')[1]);

      // separate out the mime component
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

      // write the bytes of the string to an ArrayBuffer
      var ab = new ArrayBuffer(byteString.length);

      // create a view into the buffer
      var ia = new Uint8Array(ab);

      // set the bytes of the buffer to the correct values
      for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }

      // write the ArrayBuffer to a blob, and you're done
      var blob = new Blob([ab], {type: mimeString});
      return blob;
    }

    describe('#constructor', function () {
        it('should instantiate correctly', function() {
            var project = new Wick.Project();
            expect(project.classname).to.equal('Project');

            expect(project.width).to.equal(720);
            expect(project.height).to.equal(405);
            expect(project.framerate).to.equal(12);
            expect(project.backgroundColor).to.equal('#ffffff');

            expect(project.zoom).to.equal(1);
            expect(project.pan.x).to.equal(0);
            expect(project.pan.y).to.equal(0);

            expect(project.focus.timeline.layers.length).to.equal(1);
            expect(project.focus.timeline.layers[0].frames.length).to.equal(1);
            expect(project.focus instanceof Wick.Clip).to.equal(true);
            expect(project.focus).to.equal(project.root);

            expect(project.project).to.equal(project);
            expect(project.focus.project).to.equal(project);
            expect(project.focus.timeline.project).to.equal(project);
            expect(project.focus.timeline.layers[0].project).to.equal(project);

            expect(project.getAssets().length).to.equal(0);
        });
    });

    describe('#serialize', function () {
        it('should serialize correctly', function() {
            var project = new Wick.Project();
            project.addAsset(new Wick.ImageAsset('foo.png', TEST_IMAGE_SRC));
            project.addAsset(new Wick.SoundAsset('foo.wav', TEST_SOUND_SRC));
            project.addAsset(new Wick.ClipAsset(new Wick.Clip()));
            var data = project.serialize();

            expect(data.classname).to.equal('Project');

            expect(data.name).to.equal(project.name);
            expect(data.width).to.equal(project.width);
            expect(data.height).to.equal(project.height);
            expect(data.zoom).to.equal(project.zoom);
            expect(data.pan.x).to.equal(project.pan.x);
            expect(data.pan.y).to.equal(project.pan.y);

            expect(data.backgroundColor).to.equal(project.backgroundColor);
            expect(data.framerate).to.equal(project.framerate);

            expect(data.root.classname).to.equal('Clip');

            expect(data.assets.length).to.equal(3);
            expect(data.assets[0].classname).to.equal('ImageAsset');
            expect(data.assets[1].classname).to.equal('SoundAsset');
            expect(data.assets[2].classname).to.equal('ClipAsset');

            expect(data.selection.uuids.length).to.equal(0);

            expect(data.onionSkinEnabled).to.equal(false);
            expect(data.onionSkinSeekForwards).to.equal(1);
            expect(data.onionSkinSeekBackwards).to.equal(1);
        });

        it('should serialize focus correctly', function() {
            var project = new Wick.Project();
            var focus = new Wick.Clip();
            project.addObject(focus);
            project.focus = focus;
            var data = project.serialize();
            expect(data.focus).to.equal(project.focus.uuid);
        });
    });

    describe('#deserialize', function () {
        it('should deserialize correctly', function() {
            var data = {
                classname: 'Project',
                assets: [
                    new Wick.ImageAsset('foo.png', TEST_IMAGE_SRC).serialize(),
                    new Wick.SoundAsset('foo.wav', TEST_SOUND_SRC).serialize(),
                    new Wick.ClipAsset(new Wick.Clip()).serialize(),
                ],
                name: 'dummy name',
                width: 1080,
                height: 720,
                backgroundColor: '#000000',
                pan: {x: 0, y: 0},
                framerate: 30,
                selection: new Wick.Selection().serialize(),
                root: new Wick.Clip().serialize(),
                onionSkinEnabled: true,
                onionSkinSeekBackwards: 5,
                onionSkinSeekForwards: 3,
            };

            var project = Wick.Project.deserialize(data);
            expect(project.getAssets()[0] instanceof Wick.ImageAsset).to.equal(true);
            expect(project.getAssets()[1] instanceof Wick.SoundAsset).to.equal(true);
            expect(project.getAssets()[2] instanceof Wick.ClipAsset).to.equal(true);
            expect(project.onionSkinEnabled).to.equal(true);
            expect(project.onionSkinSeekBackwards).to.equal(5);
            expect(project.onionSkinSeekForwards).to.equal(3);
            expect(project.getAssets()[0].src).to.equal(TEST_IMAGE_SRC);
            expect(project.getAssets()[1].src).to.equal(TEST_SOUND_SRC);
        });

        it('should deserialize focus correctly', function() {
            var project = new Wick.Project();
            var focus = new Wick.Clip();
            project.addObject(focus);
            project.focus = focus;
            var data = project.serialize();

            var projectFromData = Wick.Base.deserialize(data);
            expect(projectFromData.focus).to.equal(projectFromData.root.activeFrame.clips[0]);
        });
    });

    describe('#fromWickFileURL', function () {

    });

    describe('#focus', function () {
      it('should clear selection when focus is changed', function () {
        var project = new Wick.Project();

        var clip1 = new Wick.Clip();
        project.activeFrame.addClip(clip1);

        var clip2 = new Wick.Clip();
        project.activeFrame.addClip(clip2);

        project.selection.select(clip1);
        project.selection.select(clip2);

        project.focus = project.root;
        expect(project.selection.numObjects).to.equal(2);

        project.focus = clip1;
        expect(project.selection.numObjects).to.equal(0);

        project.selection.select(clip1.activeFrame);
        project.focus = clip1;
        expect(project.selection.numObjects).to.equal(1);
        project.focus = project.root;
        expect(project.selection.numObjects).to.equal(0);
      });

      it('should reset plahead positions of subclips on focus change to parent', function () {
        var project = new Wick.Project();
        project.focus.activeFrame.end = 10;
        project.focus.timeline.playheadPosition = 2;

        var clip1 = new Wick.Clip();
        clip1.activeFrame.end = 5;
        clip1.timeline.playheadPosition = 3;
        project.activeFrame.addClip(clip1);

        var clip2 = new Wick.Clip();
        clip2.activeFrame.end = 5;
        clip2.timeline.playheadPosition = 4;
        project.activeFrame.addClip(clip2);

        // Updating focus should always reset subclip timelines.
        project.focus = project.root;
        expect(project.root.timeline.playheadPosition).to.equal(2);
        expect(clip1.timeline.playheadPosition).to.equal(1);
        expect(clip2.timeline.playheadPosition).to.equal(1);

        // Change focus to subclip, no playhead positions should change
        project.focus = clip1;
        expect(project.root.timeline.playheadPosition).to.equal(2);
        expect(clip1.timeline.playheadPosition).to.equal(1);
        expect(clip2.timeline.playheadPosition).to.equal(1);

        // Change playhead position of focused clip and set focus again, should not change playhead positions
        clip1.timeline.playheadPosition = 5;
        project.focus = clip1;
        expect(project.root.timeline.playheadPosition).to.equal(2);
        expect(clip1.timeline.playheadPosition).to.equal(5);
        expect(clip2.timeline.playheadPosition).to.equal(1);

        // Focus root again, playhead positions should reset
        project.focus = project.root;
        expect(project.root.timeline.playheadPosition).to.equal(2);
        expect(clip1.timeline.playheadPosition).to.equal(1);
        expect(clip2.timeline.playheadPosition).to.equal(1);
      });
    })

    describe('#addObject', function () {
      it('should add paths to the project', function() {
        let project = new Wick.Project();
        let path = new Wick.Path();
        expect(project.activeFrame.paths.length).to.equal(0);
        let returnValue = project.addObject(path);
        expect(returnValue).to.equal(true);
        expect(project.activeFrame.paths.length).to.equal(1);
        expect(project.activeFrame.paths[0].uuid).to.equal(path.uuid);
        expect(project.getChildByUUID(path.uuid).uuid).to.equal(path.uuid);
      });

      it('should add clips to the project', function() {
        let project = new Wick.Project();
        let clip = new Wick.Clip();
        expect(project.activeFrame.clips.length).to.equal(0);
        let returnValue = project.addObject(clip);
        expect(returnValue).to.equal(true);
        expect(project.activeFrame.clips.length).to.equal(1);
        expect(project.activeFrame.clips[0].uuid).to.equal(clip.uuid);
        expect(project.getChildByUUID(clip.uuid).uuid).to.equal(clip.uuid);
      });

      it('should add frames to the project', function() {
        let project = new Wick.Project();
        let frame = new Wick.Frame();
        expect(project.activeLayer.frames.length).to.equal(1);
        let returnValue = project.addObject(frame);
        expect(returnValue).to.equal(true);
        expect(project.activeLayer.frames.length).to.equal(2);
        expect(project.activeLayer.frames[1].uuid).to.equal(frame.uuid);
        expect(project.getChildByUUID(frame.uuid).uuid).to.equal(frame.uuid);
      });

      it('should add layers to the project', function() {
        let project = new Wick.Project();
        let layer = new Wick.Layer();
        expect(project.activeTimeline.layers.length).to.equal(1);
        let returnValue = project.addObject(layer);
        expect(returnValue).to.equal(true);
        expect(project.activeTimeline.layers.length).to.equal(2);
        expect(project.activeTimeline.layers[1].uuid).to.equal(layer.uuid);
        expect(project.getChildByUUID(layer.uuid).uuid).to.equal(layer.uuid);
      });

      it('should add tweens to the project', function() {
        let project = new Wick.Project();
        let tween = new Wick.Tween();
        expect(project.activeFrame.tweens.length).to.equal(0);
        let returnValue = project.addObject(tween);
        expect(returnValue).to.equal(true);
        expect(project.activeFrame.tweens.length).to.equal(1);
        expect(project.activeFrame.tweens[0].uuid).to.equal(tween.uuid);
        expect(project.getChildByUUID(tween.uuid).uuid).to.equal(tween.uuid);
      });

      it('should add assets to the project', function() {
        let project = new Wick.Project();
        let asset = new Wick.Asset();
        expect(project.getAssets().length).to.equal(0);
        let returnValue = project.addObject(asset);
        expect(returnValue).to.equal(true);
        expect(project.getAssets().length).to.equal(1);
        expect(project.getAssets()[0].uuid).to.equal(asset.uuid);
        expect(project.getChildByUUID(asset.uuid).uuid).to.equal(asset.uuid);
      });

      it('should not add random objects to the project', function() {
        let project = new Wick.Project();
        let obj = {};
        expect(project.activeFrame.children.length).to.equal(0);
        let returnValue = project.addObject(obj);
        expect(returnValue).to.equal(false);
        expect(project.activeFrame.children.length).to.equal(0);
      });
    });

    describe('#importFile', function () {
        it('should import sounds correctly', function(done) {
            var parts = [ dataURItoBlob(TEST_SOUND_SRC) ];
            var file = new File(parts, 'test.wav', {
                lastModified: new Date(0),
                type: "audio/wav"
            });

            var project = new Wick.Project();
            project.importFile(file, function (asset) {
                expect(asset instanceof Wick.SoundAsset).to.equal(true);
                expect(project.getAssets().length).to.equal(1);
                expect(project.getAssets()[0]).to.equal(asset);
                expect(asset.src).to.equal(TEST_SOUND_SRC);
                done();
            });
        });

        it('should import images correctly', function(done) {
            var parts = [ dataURItoBlob(TEST_IMAGE_SRC) ];
            var file = new File(parts, 'test.png', {
                lastModified: new Date(0),
                type: "image/png"
            });

            var project = new Wick.Project();
            project.importFile(file, function (asset) {
                expect(asset instanceof Wick.ImageAsset).to.equal(true);
                expect(project.getAssets().length).to.equal(1);
                expect(project.getAssets()[0]).to.equal(asset);
                expect(asset.src).to.equal(TEST_IMAGE_SRC);
                done();
            });
        });
    });

    describe('#tick', function () {
        it('should tick without error', function() {
            var project = new Wick.Project();
            var error = project.tick();
            expect(error).to.equal(null);
        });

        it('should tick with child clips', function() {
            var project = new Wick.Project();

            project.activeFrame.addClip(new Wick.Clip());
            project.activeFrame.addClip(new Wick.Button());

            var error = project.tick();
            expect(error).to.equal(null);
        });

        it('should run scripts of children on tick', function() {
            var project = new Wick.Project();

            project.activeFrame.addScript('load', 'this.__dummy = "foo"');

            var clip = new Wick.Clip();
            clip.addScript('load', 'var e = 0;');
            project.activeFrame.addClip(clip);

            var error = project.tick();
            expect(error).to.equal(null);
            expect(project.activeFrame.__dummy).to.equal('foo');
        });

        it('should advance timeline on tick', function() {
            var project = new Wick.Project();
            project.focus.timeline.layers[0].addFrame(new Wick.Frame(2));
            project.tick();
            project.tick(); // (tick twice because first tick calls onActivated not onActive)
            expect(project.focus.timeline.playheadPosition).to.equal(2);
        });

        it('should advance timeline on tick (inside a clip)', function() {
            var project = new Wick.Project();
            var focus = new Wick.Clip();
            project.addObject(focus);
            project.focus = focus;

            focus.timeline.addLayer(new Wick.Layer());
            focus.timeline.layers[0].addFrame(new Wick.Frame());
            focus.activeFrame.end = 10;

            project.tick();
            project.tick(); // (tick twice because first tick calls onActivated not onActive)
            expect(project.focus.timeline.playheadPosition).to.equal(2);
        });

        it('should advance timeline on tick (inside a clip) and ignore scripts of that clip', function() {
            var project = new Wick.Project();
            var focus = new Wick.Clip();
            focus.addScript('update', 'this.stop()');
            project.addObject(focus);
            project.focus = focus;

            focus.timeline.addLayer(new Wick.Layer());
            focus.timeline.layers[0].addFrame(new Wick.Frame());
            focus.activeFrame.end = 10;

            project.tick();
            project.tick(); // (tick twice because first tick calls onActivated not onActive)
            expect(project.focus.timeline.playheadPosition).to.equal(2);
        });

        it('should tween an object correctly', function () {
            var project = new Wick.Project();

            var frame = project.activeFrame;
            frame.end = 9;

            var clip = new Wick.Clip();
            frame.addClip(clip);

            var tweenA = new Wick.Tween(1, new Wick.Transformation(0, 0, 1, 1, 0, 1), 0);
            var tweenB = new Wick.Tween(5, new Wick.Transformation(100, 200, 2, 0.5, 180, 0.0), 0);
            var tweenC = new Wick.Tween(9, new Wick.Transformation(100, 200, 2, 0.5, 180, 1.0), 0);
            frame.addTween(tweenA);
            frame.addTween(tweenB);
            frame.addTween(tweenC);

            project.tick(); // playhead = 1

            expect(clip.transform.x).to.be.closeTo(0, 0.01);
            expect(clip.transform.y).to.be.closeTo(0, 0.01);
            expect(clip.transform.scaleX).to.be.closeTo(1, 0.01);
            expect(clip.transform.scaleY).to.be.closeTo(1, 0.01);
            expect(clip.transform.rotation).to.be.closeTo(0, 0.01);
            expect(clip.transform.opacity).to.be.closeTo(1, 0.01);

            project.tick(); // playhead = 2
            project.tick(); // playhead = 3

            expect(clip.transform.x).to.be.closeTo(50, 0.01);
            expect(clip.transform.y).to.be.closeTo(100, 0.01);
            expect(clip.transform.scaleX).to.be.closeTo(1.5, 0.01);
            expect(clip.transform.scaleY).to.be.closeTo(0.75, 0.01);
            expect(clip.transform.rotation).to.be.closeTo(90, 0.01);
            expect(clip.transform.opacity).to.be.closeTo(0.5, 0.01);

            project.tick(); // playhead = 4
            project.tick(); // playhead = 5

            expect(clip.transform.x).to.be.closeTo(100, 0.01);
            expect(clip.transform.y).to.be.closeTo(200, 0.01);
            expect(clip.transform.scaleX).to.be.closeTo(2, 0.01);
            expect(clip.transform.scaleY).to.be.closeTo(0.5, 0.01);
            expect(clip.transform.rotation).to.be.closeTo(180, 0.01);
            expect(clip.transform.opacity).to.be.closeTo(0.0, 0.01);

            project.tick(); // playhead = 6
            project.tick(); // playhead = 7

            expect(clip.transform.x).to.be.closeTo(100, 0.01);
            expect(clip.transform.y).to.be.closeTo(200, 0.01);
            expect(clip.transform.scaleX).to.be.closeTo(2, 0.01);
            expect(clip.transform.scaleY).to.be.closeTo(0.5, 0.01);
            expect(clip.transform.rotation).to.be.closeTo(180, 0.01);
            expect(clip.transform.opacity).to.be.closeTo(0.5, 0.01);

            project.tick(); // playhead = 8
            project.tick(); // playhead = 9

            expect(clip.transform.x).to.be.closeTo(100, 0.01);
            expect(clip.transform.y).to.be.closeTo(200, 0.01);
            expect(clip.transform.scaleX).to.be.closeTo(2, 0.01);
            expect(clip.transform.scaleY).to.be.closeTo(0.5, 0.01);
            expect(clip.transform.rotation).to.be.closeTo(180, 0.01);
            expect(clip.transform.opacity).to.be.closeTo(1.0, 0.01);
        });
    });

    describe('#play', function () {
        it('should play without error', function() {
            var project = new Wick.Project();
        });

        it('should send error through callback if there is an error', function(done) {
            var project = new Wick.Project();
            project.framerate = 60;

            project.activeFrame.addScript('load', 'thisWillCauseAnError();');

            project.play({
                onError: error => {
                expect(error.message).to.equal('thisWillCauseAnError is not defined');
                    done();
                }
            });
        });

        it('should send error through callback if there is an error after a few ticks', function(done) {
            var project = new Wick.Project();
            project.framerate = 60;

            project.activeLayer.addFrame(new Wick.Frame(2,5));
            var frame = new Wick.Frame(6);
            project.activeLayer.addFrame(frame);
            frame.addScript('load', 'thisWillCauseAnError();');

            project.play({
                onError: error => {
                    expect(error.message).to.equal('thisWillCauseAnError is not defined');
                    done();
                },
            });
        });
    });

    describe('#stop', function () {
        it('should stop project from running so that a script doesnt run', function(done) {
            var project = new Wick.Project();
            project.activeFrame.addScript('load', 'thisWillCauseAnError();');
            project.play({
                onError: error => {
                    throw Error('The script ran, it should not have!');
                    expect(false).to.equal(true);
                }
            });
            project.stop();
            done();
        });

        it('should stop all sounds', function (done) {
            var project = new Wick.Project();
            var sound = new Wick.SoundAsset('test.wav', TEST_SOUND_SRC);
            project.addAsset(sound);
            project.activeFrame.sound = sound;
            project.activeFrame.end = 10;

            project.play({
                onAfterTick: () => {
                    expect(project.activeFrame.isSoundPlaying()).to.equal(true);
                    project.stop();
                    expect(project.activeFrame.isSoundPlaying()).to.equal(false);
                    done();
                }
            });
        });

        it('should run unload scripts on all clips when the project is stopped', function (done) {
            var project = new Wick.Project();

            var rootLevelClip = new Wick.Clip();
            rootLevelClip.addScript('unload', 'this.__unloadScriptRan = true;');
            project.activeFrame.addClip(rootLevelClip);

            var childClip = new Wick.Clip();
            childClip.addScript('unload', 'this.__unloadScriptRan = true;');
            rootLevelClip.activeFrame.addClip(childClip);

            project.play({
                onAfterTick: () => {
                    project.stop();
                    expect(rootLevelClip.__unloadScriptRan).to.equal(true);
                    expect(childClip.__unloadScriptRan).to.equal(true);
                    done();
                }
            });
        });
    });

    describe('#getAllFrames', function () {
        it('should return all frames in the project', function () {
            var project = new Wick.Project();

            var rootLevelClip = new Wick.Clip();
            rootLevelClip.addScript('unload', 'this.__unloadScriptRan = true;');
            project.activeFrame.addClip(rootLevelClip);

            var childClip = new Wick.Clip();
            childClip.addScript('unload', 'this.__unloadScriptRan = true;');
            rootLevelClip.activeFrame.addClip(childClip);

            expect(project.getAllFrames().length).to.equal(3);
            expect(project.getAllFrames()[0]).to.equal(project.root.activeFrame);
            expect(project.getAllFrames()[1]).to.equal(rootLevelClip.activeFrame);
            expect(project.getAllFrames()[2]).to.equal(childClip.activeFrame);
        });
    });

    describe('#createClipFromSelection', function () {
        it('should create a clip out of selected paths', function () {
            var project = new Wick.Project();

            project.activeFrame.addPath(new Wick.Path(new paper.Path.Rectangle({
                from: [50, 50],
                to: [100, 100],
                fillColor: 'red',
            }).exportJSON({asString:false})));
            project.activeFrame.addPath(new Wick.Path(new paper.Path.Rectangle({
                from: [100, 100],
                to: [150, 150],
                fillColor: 'red',
            }).exportJSON({asString:false})));

            project.selection.select(project.activeFrame.paths[0]);
            project.selection.select(project.activeFrame.paths[1]);

            project.createSymbolFromSelection('foo', 'Clip');

            expect(project.activeFrame.paths.length).to.equal(0);
            expect(project.activeFrame.clips.length).to.equal(1);
            expect(project.activeFrame.clips[0] instanceof Wick.Clip).to.equal(true);
            expect(project.activeFrame.clips[0] instanceof Wick.Button).to.equal(false);
            expect(project.activeFrame.clips[0].activeFrame.paths.length).to.equal(2);
            expect(project.activeFrame.clips[0].activeFrame.clips.length).to.equal(0);
        });

        it('should create a clip out of selected clips', function () {
            var project = new Wick.Project();

            var clip1 = new Wick.Clip('foo', [new Wick.Path(new paper.Path.Rectangle({
                from: [50, 50],
                to: [100, 100],
                fillColor: 'red',
            }).exportJSON({asString:false}))]);
            project.activeFrame.addClip(clip1);

            var clip2 = new Wick.Clip('foo', [new Wick.Path(new paper.Path.Rectangle({
                from: [100, 100],
                to: [150, 150],
                fillColor: 'red',
            }).exportJSON({asString:false}))]);
            project.activeFrame.addClip(clip2);

            project.selection.select(project.activeFrame.clips[0]);
            project.selection.select(project.activeFrame.clips[1]);

            project.createSymbolFromSelection('bar', 'Clip');

            expect(project.activeFrame.paths.length).to.equal(0);
            expect(project.activeFrame.clips.length).to.equal(1);
            expect(project.activeFrame.clips[0] instanceof Wick.Clip).to.equal(true);
            expect(project.activeFrame.clips[0] instanceof Wick.Button).to.equal(false);
            expect(project.activeFrame.clips[0].activeFrame.paths.length).to.equal(0);
            expect(project.activeFrame.clips[0].activeFrame.clips.length).to.equal(2);
        });

        it('should create a clip out of selected clips and paths', function () {
            var project = new Wick.Project();
            project.activeFrame.addPath(new Wick.Path(new paper.Path.Rectangle({
                from: [50, 50],
                to: [100, 100],
                fillColor: 'red',
            }).exportJSON({asString:false})));

            var clip = new Wick.Clip('foo', [new Wick.Path(new paper.Path.Rectangle({
                from: [100, 100],
                to: [150, 150],
                fillColor: 'red',
            }).exportJSON({asString:false}))]);
            project.activeFrame.addClip(clip);

            project.selection.select(project.activeFrame.paths[0]);
            project.selection.select(project.activeFrame.clips[0]);

            project.createSymbolFromSelection('bar', 'Clip');

            expect(project.activeFrame.paths.length).to.equal(0);
            expect(project.activeFrame.clips.length).to.equal(1);
            expect(project.activeFrame.clips[0] instanceof Wick.Clip).to.equal(true);
            expect(project.activeFrame.clips[0] instanceof Wick.Button).to.equal(false);
            expect(project.activeFrame.clips[0].activeFrame.paths.length).to.equal(1);
            expect(project.activeFrame.clips[0].activeFrame.clips.length).to.equal(1);
        });
    });

    describe('#createButtonFromSelection', function () {
        it('should create a button out of selected paths', function () {
            var project = new Wick.Project();

            project.activeFrame.addPath(new Wick.Path(new paper.Path.Rectangle({
                from: [50, 50],
                to: [100, 100],
                fillColor: 'red',
            }).exportJSON({asString:false})));
            project.activeFrame.addPath(new Wick.Path(new paper.Path.Rectangle({
                from: [100, 100],
                to: [150, 150],
                fillColor: 'red',
            }).exportJSON({asString:false})));

            project.selection.select(project.activeFrame.paths[0]);
            project.selection.select(project.activeFrame.paths[1]);

            project.createSymbolFromSelection('foo', 'Button');

            expect(project.activeFrame.paths.length).to.equal(0);
            expect(project.activeFrame.clips.length).to.equal(1);
            expect(project.activeFrame.clips[0] instanceof Wick.Button).to.equal(true);
        });
    });

    describe('#deleteSelectedObjects', function () {
        it('should delete all selected objects', function () {
            var project = new Wick.Project();

            var clip = new Wick.Clip();
            var button = new Wick.Button();
            var path = new Wick.Path();
            var imageAsset = new Wick.ImageAsset('test.png', TEST_IMAGE_SRC);
            var soundAsset = new Wick.ImageAsset('test.wav', TEST_SOUND_SRC);
            var layer = new Wick.Layer();
            var frame = new Wick.Frame(2);
            var tween = new Wick.Tween();

            project.activeFrame.addClip(clip);
            project.activeFrame.addClip(button);
            project.activeFrame.addPath(path);
            project.addAsset(imageAsset);
            project.addAsset(soundAsset);
            project.focus.timeline.addLayer(layer);
            project.activeLayer.addFrame(frame);
            project.activeFrame.addTween(tween);

            project.selection.select(clip);
            project.selection.select(button);
            project.selection.select(path);

            expect(project.selection.numObjects).to.equal(3);
            expect(project.activeFrame.paths.length).to.equal(1);
            expect(project.activeFrame.clips.length).to.equal(2);

            project.deleteSelectedObjects();

            expect(project.activeFrame.paths.length).to.equal(0);
            expect(project.activeFrame.clips.length).to.equal(0);
            expect(project.selection.numObjects).to.equal(0);
        });
    });

    describe('#exportAsWickFile/fromWickFile', function () {
        it('should create and load a project from a wick file correctly with no assets', function (done) {
            var project = new Wick.Project();

            project.exportAsWickFile(function (wickFile) {
                Wick.Project.fromWickFile(wickFile, function (loadedProject) {
                    expect(loadedProject instanceof Wick.Project).to.equal(true);
                    expect(loadedProject.getAssets().length).to.equal(0);
                    done();
                });
            });
        });

        it('should create and load a project from a wick file correctly with assets', function (done) {
            var project = new Wick.Project();
            Wick.FileCache.clear();

            var imageAsset = new Wick.ImageAsset();
            imageAsset.src = TEST_IMAGE_SRC;
            project.addAsset(imageAsset);

            var soundAsset = new Wick.SoundAsset();
            soundAsset.src = TEST_SOUND_SRC;
            project.addAsset(soundAsset);

            project.exportAsWickFile(function (wickFile) {
                Wick.FileCache.clear();
                Wick.Project.fromWickFile(wickFile, function (loadedProject) {
                    expect(loadedProject instanceof Wick.Project).to.equal(true);
                    expect(loadedProject.getAssets().length).to.equal(project.getAssets().length);
                    expect(loadedProject.getAssets()[0].uuid).to.equal(project.getAssets()[0].uuid);
                    expect(loadedProject.getAssets()[1].uuid).to.equal(project.getAssets()[1].uuid);
                    expect(loadedProject.getAssets()[0].src).to.equal(project.getAssets()[0].src);
                    expect(loadedProject.getAssets()[1].src).to.equal(project.getAssets()[1].src);
                    done();
                });
            });
        });
    });

    describe('#getAssets', function () {
        it('should return all assets', function () {
            var project = new Wick.Project();

            var imageAsset = new Wick.ImageAsset();
            imageAsset.src = TEST_IMAGE_SRC;
            project.addAsset(imageAsset);

            var soundAsset = new Wick.SoundAsset();
            soundAsset.src = TEST_SOUND_SRC;
            project.addAsset(soundAsset);

            var clipAsset = new Wick.ClipAsset();
            project.addAsset(clipAsset);

            expect(project.getAssets()).to.eql([imageAsset, soundAsset, clipAsset]);
        });

        it('should return image assets', function () {
            var project = new Wick.Project();

            var imageAsset = new Wick.ImageAsset();
            imageAsset.src = TEST_IMAGE_SRC;
            project.addAsset(imageAsset);

            var soundAsset = new Wick.SoundAsset();
            soundAsset.src = TEST_SOUND_SRC;
            project.addAsset(soundAsset);

            var clipAsset = new Wick.ClipAsset();
            project.addAsset(clipAsset);

            expect(project.getAssets('Image')).to.eql([imageAsset]);
        });

        it('should return sound assets', function () {
            var project = new Wick.Project();

            var imageAsset = new Wick.ImageAsset();
            imageAsset.src = TEST_IMAGE_SRC;
            project.addAsset(imageAsset);

            var soundAsset = new Wick.SoundAsset();
            soundAsset.src = TEST_SOUND_SRC;
            project.addAsset(soundAsset);

            var clipAsset = new Wick.ClipAsset();
            project.addAsset(clipAsset);

            expect(project.getAssets('Sound')).to.eql([soundAsset]);
        });

        it('should return clip assets', function () {
            var project = new Wick.Project();

            var imageAsset = new Wick.ImageAsset();
            imageAsset.src = TEST_IMAGE_SRC;
            project.addAsset(imageAsset);

            var soundAsset = new Wick.SoundAsset();
            soundAsset.src = TEST_SOUND_SRC;
            project.addAsset(soundAsset);

            var clipAsset = new Wick.ClipAsset();
            project.addAsset(clipAsset);

            expect(project.getAssets('Clip')).to.eql([clipAsset]);
        });
    });

    describe('#generateImageSequence', function () {
        it('should export correct images', function () {
            // TODO
        });
    });

    describe('#isKeyDown', function () {
        // TODO
    });

    describe('#isKeyJustPressed', function () {
        // TODO
    });
});
