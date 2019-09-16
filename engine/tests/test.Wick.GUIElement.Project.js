describe('Wick.GUIElement.Project', function() {
    it('should render timeline correctly', function () {
        var project = new Wick.Project();
        var parentClip = new Wick.Clip({identifier: 'Parent clip'});
        var childClip = new Wick.Clip({identifier: 'Child clip'});
        project.activeFrame.addClip(parentClip);
        parentClip.activeFrame.addClip(childClip);
        project.focus = childClip;

        project.activeTimeline.playheadPosition = 3;
        project.onionSkinEnabled = true;

        project.activeLayer.addFrame(new Wick.Frame({start: 2}));
        project.activeLayer.addFrame(new Wick.Frame({start: 3}));
        project.activeLayer.getFrameAtPlayheadPosition(1).addClip(new Wick.Clip());
        project.activeLayer.addFrame(new Wick.Frame({start: 4, end: 10}));
        var sound = new Wick.SoundAsset({filename:'test.wav', src:TestUtils.TEST_SOUND_SRC_MP3});
        project.addAsset(sound);
        project.activeLayer.getFrameAtPlayheadPosition(4).sound = sound;

        var layer2 = new Wick.Layer({name: 'LayerWithTweensVeryLongName'});
        project.activeTimeline.addLayer(layer2);
        var tweenFrame = new Wick.Frame({start: 1, end: 15});
        layer2.addFrame(tweenFrame);
        tweenFrame.addTween(new Wick.Tween({playheadPosition: 1}));
        tweenFrame.addTween(new Wick.Tween({playheadPosition: 5}));
        tweenFrame.addTween(new Wick.Tween({playheadPosition: 10}));

        var layer3 = new Wick.Layer({name: 'LayerWithName'});
        layer3.locked = true;
        project.activeTimeline.addLayer(layer3);
        var scriptFrame = new Wick.Frame({identifier: 'FrameWithIdentifier2', start:1, end:2});
        scriptFrame.addScript('default', 'this.thereIsCodeInHereLol = true;');
        layer3.addFrame(scriptFrame);
        layer3.addFrame(new Wick.Frame({identifier: 'FrameWithIdentifier', start:3, end:5}));
        var tweenFrame2 = new Wick.Frame({start: 6, end: 15});
        layer3.addFrame(tweenFrame2);
        tweenFrame2.addTween(new Wick.Tween({playheadPosition: 1}));
        tweenFrame2.addTween(new Wick.Tween({playheadPosition: 5}));
        tweenFrame2.addTween(new Wick.Tween({playheadPosition: 10}));

        var layer4 = new Wick.Layer();
        project.activeTimeline.addLayer(layer4);
        layer4.addFrame(new Wick.Frame());
        layer4.hidden = true;

        project.onionSkinEnabled = true;

        var dummy = document.createElement('div');
        dummy.style.width = 600;
        dummy.style.height = 300;
        document.body.appendChild(dummy);
        project.guiElement.canvasContainer = dummy;
        //dummy.appendChild(project.guiElement.canvasContainer);

        sound.load(() => {
            project.guiElement.draw();
        });
    });
});
