describe('Wick.GUIElement.Project', function() {
    it('should render frames correctly', function () {
        var project = new Wick.Project();
        project.activeLayer.addFrame(new Wick.Frame({start: 2}));
        project.activeLayer.addFrame(new Wick.Frame({start: 3}));
        project.activeLayer.getFrameAtPlayheadPosition(1).addClip(new Wick.Clip());
        project.activeLayer.addFrame(new Wick.Frame({start: 4, end: 10}));

        var layer2 = new Wick.Layer();
        project.activeTimeline.addLayer(layer2);
        var tweenFrame = new Wick.Frame({start: 1, end: 10});
        layer2.addFrame(tweenFrame);
        tweenFrame.addTween(new Wick.Tween({playheadPosition: 1}));
        tweenFrame.addTween(new Wick.Tween({playheadPosition: 5}));
        tweenFrame.addTween(new Wick.Tween({playheadPosition: 10}));

        var layer3 = new Wick.Layer();
        project.activeTimeline.addLayer(layer3);
        layer3.addFrame(new Wick.Frame());
        layer3.locked = true;

        var layer4 = new Wick.Layer();
        project.activeTimeline.addLayer(layer4);
        layer4.addFrame(new Wick.Frame());
        layer4.hidden = true;

        var sound = new Wick.SoundAsset({filename:'test.wav', src:TestUtils.TEST_SOUND_SRC_WAV});
        project.addAsset(sound);
        project.activeLayer.getFrameAtPlayheadPosition(4).sound = sound;

        project.onionSkinEnabled = true;

        var dummy = document.createElement('div');
        dummy.style.width = 600;
        dummy.style.height = 400;
        document.body.appendChild(dummy);
        dummy.appendChild(project.guiElement.canvasContainer);

        sound.load(() => {
            project.guiElement.draw();
        });
    });
});
