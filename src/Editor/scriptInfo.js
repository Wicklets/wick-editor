
class ScriptInfoInterface extends Object {
    get scriptsByType () {
        return {
            'Mouse': ['mouseenter', 'mouseleave', 'mousehover', 'mousepressed', 'mousedown', 'mousereleased', 'mousedrag', 'mouseclick'],
            'Keyboard': ['keypressed', 'keyreleased', 'keydown'],
            'Timeline': ['load', 'update', 'unload', 'default'],
        }
    }

    get scriptTypeColors () {
        return {
            'Timeline': 'blue',
            'Mouse': 'green',
            'Keyboard': 'yellow',
        }
    }

    get scriptDescriptions () {
        return {
            'default' : 'Once, before all other scripts',
            'mouseclick' : 'Once, when the mouse goes down then up over an object',
            'mousedown' : 'Every tick, when the mouse is down on the object',
            'mousedrag' : 'Every tick, when the mouse moves while down',
            'mouseenter' : 'Once, when the mouse enters the object',
            'mousehover' : 'Every tick, when the mouse is over the object',
            'mouseleave' : 'Once, when the mouse leaves the object',
            'mousepressed' : 'Once, when the mouse presses down on the object',
            'mousereleased' : 'Once, when the mouse is released over the object',
            'keypressed' : 'Once, when any key is pushed down',
            'keyreleased' : 'Once, when any key is released',
            'keydown' : 'Every tick, when any key is down',
            'load' : 'Once, when the frame is entered',
            'unload' : 'Once, when the frame is exited',
            'update' : 'Every tick, while the project is playing',
        }
    }

    get referenceItems () {
        return {
            'Timelines' : this.timelineReference,
            'Clips & Buttons' : this.objectReference,
            'Text' : this.textReference,
            'Input' : this.inputReference,
            'Project' : this.projectReference,
            'Random' : this.randomReference,
            'Sound' : this.soundReference,
            'Event' : this.eventReference,
            'Misc.' : this.miscReference,
        }
    }

    get timelineReference () {
        return (
            [
                {
                    name: 'play',
                    snippet: 'play()',
                    description: 'Plays the parent timeline that this object belongs to.',
                    warning: 'To control a Clip\'s own timeline, use this.play();',
                },
                {
                    name: 'stop',
                    snippet: 'stop()',
                    description: 'Stops the parent timeline that this object belongs to.',
                    warning: 'To control a Clip\'s own timeline, use this.stop();',
                },
                {
                    name: 'gotoAndPlay',
                    snippet: 'gotoAndPlay(1)',
                    description: 'Moves the playhead to a frame on the timeline that this object belongs to, and plays that timeline.',
                    warning: 'To control a Clip\'s own timeline, use this.gotoAndPlay();',
                    params: [{name: 'frame', type: '{string|Number}'}],
                },
                {
                    name: 'gotoAndStop',
                    snippet: 'gotoAndStop(1)',
                    description: 'Moves the playhead to a frame on the timeline that this object belongs to, and stops that timeline.',
                    warning: 'To control a Clip\'s own timeline, use this.gotoAndStop();',
                    params: [{name: 'frame', type: '{string|Number}'}],
                },
                {
                    name: 'gotoAndLoop',
                    snippet: 'gotoAndLoop(1, 10, true)',
                    description: 'Repeats a specific part of the timeline this object belongs to.',
                    warning: 'To control a Clip\'s own timeline, always use this.gotoAndLoop();',
                    params: [{name: 'startFrame', type: '{string|Number}'},
                             {name: 'endFrame', type: '{string|Number}'},
                             {name: 'loop', type: '{bool|Number}', description: 'If true, will loop forever. If false, will play once and stop. If a number, it will play that many times in total.'}],
                },
                {
                    name: 'gotoNextFrame',
                    snippet: 'gotoNextFrame()',
                    description: 'Moves the playhead to the next frame on the timeline that this object belongs to.',
                    warning: 'To control a Clip\'s own timeline, use this.gotoNextFrame();',
                },
                {
                    name: 'gotoPrevFrame',
                    snippet: 'gotoPrevFrame()',
                    description: 'Moves the playhead to the previous frame on the timeline that this object belongs to.',
                    warning: 'To control a Clip\'s own timeline, use this.gotoPrevFrame();',
                }
            ]
        );
    }

    get objectReference () {
        return (
            [
                {
                    name: 'identifier',
                    snippet: 'this.identifier',
                    description: 'The name of this Clip. Type a Clip\'s identifier to access it in your code.' ,
                },
                {
                    name: 'parentClip',
                    snippet: 'parentClip',
                    description: 'Returns the Clip that owns the calling object.',
                },
                {
                    name: 'parentFrame',
                    snippet: 'parentFrame',
                    description: 'Returns the Frame that owns the calling object.',
                },
                {
                    name: 'project',
                    snippet: 'project',
                    description: 'Returns the project - an object that contains all the other objects.\nYou can use this to access Clips: for example, "project.myClip".',
                },
                {
                    name: 'x',
                    snippet: 'this.x',
                    description: 'The x position of the object. (Left to Right)',
                },
                {
                    name: 'y',
                    snippet: 'this.y',
                    description: 'The y position of the object. (Up to Down)',
                },
                {
                    name: 'width',
                    snippet: 'this.width',
                    description: 'The width of the object.',
                },
                {
                    name: 'height',
                    snippet: 'this.height',
                    description: 'The height of the object.',
                },
                {
                    name: 'scaleX',
                    snippet: 'this.scaleX',
                    description: 'The scale of the object on the x-axis.',
                },
                {
                    name: 'scaleY',
                    snippet: 'this.scaleY',
                    description: 'The scale of the object on the y-axis.',
                },
                {
                    name: 'rotation',
                    snippet: 'this.rotation',
                    description: 'The rotation of the object.',
                },
                {
                    name: 'opacity',
                    snippet: 'this.opacity',
                    description: 'The opacity of the object. 0 is completely transparent, 1 is completely opaque.',
                },
                {
                    name: 'playheadPosition',
                    snippet: 'this.playheadPosition',
                    description: 'The number of the current frame being displayed by this Clip.',
                },
                {
                    name: 'currentFrameName',
                    snippet: 'this.currentFrameName',
                    description: 'The name of the current frame being displayed by this Clip.',
                },
                {
                    name: 'playing',
                    snippet: 'this.playing',
                    description: 'Is this Clip playing?',
                },
                {
                    name: 'playingInReverse',
                    snippet: 'this.playingInReverse',
                    description: 'Is this Clip playing in reverse?',
                },
                {
                    name: 'length',
                    snippet: 'this.length',
                    description: 'The length of this Clip\'s timeline.',
                },
                {
                    name: 'clone',
                    snippet: 'this.clone()',
                    description: 'Creates a clone of this object, places it on the same frame, and returns a reference to it.',
                    warning: 'Too many clones can cause performance issues.'
                },
                {
                    name: 'clones',
                    snippet: 'this.clones',
                    description: 'An array of every clone of an object.',
                },
                {
                    name: 'remove',
                    snippet: 'this.remove()',
                    description: 'Removes this object from the project.',
                },
                {
                    //NOTE: it might be faster to accept a Clip object rather than a string
                    name: 'hitTest',
                    snippet: 'this.hitTest(that)',
                    description: 'Determines if the hitboxes of two objects overlap.',
                    param: [{name: 'that', type: '{string}'}],
                    returns: [{type: 'bool', description: 'Returns true if the given object intersects this object.'}],
                    deprecated: true,
                },
                {
                    name: 'if (hitTest)',
                    snippet: 'if (this.hitTest(that)) {\n // Add your code here! \n}\n',
                    description: 'Runs some custom code when the two objects tested are hitting each other.',
                    param: [{name: 'that', type: '{string}'}],
                    returns: [{type: 'bool', description: 'Returns true if the given object intersects this object.'}],
                    deprecated: true,
                },

            ]
        );
    }
    
    get textReference () {
        return(
            [
                {
                    name: 'setText',
                    snippet: 'textName.setText("Text")',
                    description: 'Changes the content of a text object.',
                    params: [{name: 'text', type: '{string}'}],
                    warning: 'For use on text objects only!',
                },
            ]
        )
    }

    get soundReference () {
        return (
            [
                {
                    name: 'playSound',
                    snippet: 'playSound("sound.mp3")',
                    description: 'Plays a sound in the asset library.',
                    params: [{name: 'name', type:'{string}', description: 'Name of the sound asset in the library.'},
                            {name: 'options', type:'{Object}', description: 'Options for the sound:\n   * seekMS - the amount of time in milliseconds to start the sound at.\n   * volume - the volume of the sound, from 0.0 - 1.0\n   * loop - if set to true, the sound will loop.'}],
                    returns: [{type: 'object', description: 'Object representing the sound which was played.'}],
                },
                {
                    name: 'stopAllSounds',
                    snippet: 'stopAllSounds()',
                    description: 'Stops all currently playing sounds.',
                },
            ]
        )
    }

    get projectReference () {
        return (
            [
                {
                    name: 'project.width',
                    snippet: 'project.width',
                    description: 'The width of the project canvas.',
                },
                {
                    name: 'project.height',
                    snippet: 'project.height',
                    description: 'The height of the project canvas.',
                },
                {
                    name: 'project.framerate',
                    snippet: 'project.framerate',
                    description: 'The framerate of the project.',
                },
            ]
        )
    }

    get randomReference () {
        return (
            [
                {
                    name: 'random.integer',
                    snippet: 'random.integer(1, 10)',
                    description: 'Returns a random whole number between a minimum and maximum.',
                },
                {
                    name: 'random.float',
                    snippet: 'random.float(0, 1)',
                    description: 'Returns a random decimal number between a minimum and maximum.',
                },
                {
                    name: 'random.choice',
                    snippet: 'random.choice(array)',
                    description: 'Returns a random item in the given array.',
                },
            ]
        )
    }


    get inputReference () {
        return (
            [
                {
                    name: 'mouseX',
                    snippet: 'mouseX',
                    description: 'The x position of the mouse on the screen.',
                },
                {
                    name: 'mouseY',
                    snippet: 'mouseY',
                    description: 'The y position of the mouse on the screen.',
                },
                {
                    name: 'mouseMoveX',
                    snippet: 'mouseMoveX',
                    description: 'The amount the mouse moved on the x-axis in the last tick.',
                },
                {
                    name: 'mouseMoveY',
                    snippet: 'mouseMoveY',
                    description: 'The amount the mouse moved on the y-axis in the last tick.',
                },
                {
                    name: 'key',
                    snippet: 'key',
                    description: 'The last key pressed.',
                },
                {
                    name: 'keys',
                    snippet: 'keys',
                    description: 'An array of all keys which are currently pressed down.',
                },
                {
                    name: 'isMouseDown',
                    snippet: 'isMouseDown()',
                    description: 'True if the mouse is currently pressed down.',
                },
                {
                    name: 'isKeyDown',
                    snippet: 'isKeyDown("a")',
                    description: 'Returns true if the given key is currently down.',
                    params: [{name: 'key', type: '{string}'}],
                    returns: [{type: 'bool', description: 'True if passed key is down.'}],
                },
                {
                    name: 'isKeyJustPressed',
                    snippet: 'isKeyJustPressed("a")',
                    description: 'Returns true if the given key was pressed within the last tick.',
                    params: [{name: 'key', type: '{string}'}],
                    returns: [{type: 'bool', description: 'True if passed key was pressed in the last frame.'}],
                },
                {
                    name: 'if (key)',
                    snippet: 'if (key === "a" ) {\n // Add your code here. \n}\n',
                    description: 'Runs if the last key pressed is equal to the letter, or symbol, tested in the condition.',
                },
            ]
        );
    }

    get eventReference () {
        let events = []
        let descriptions = this.scriptDescriptions;

        Object.keys(descriptions).forEach( (key) => {
            if (key !== 'default') {
                events.push({
                    name: key,
                    snippet: "onEvent('<EVENT_FN>', function () {\n\t//Add code here!\n});".replace('<EVENT_FN>', key),
                    description: descriptions[key],
                });
            }
        });

        return events;
    }
    
    get miscReference () {
        return (
            [
                {
                    name: 'lerp()',
                    snippet: 'lerp(0, 1, 0.5)',
                    description: 'Linear interpolation.',
                    params: [{name: 'a', type: '{Number}'},
                             {name: 'b', type: '{Number}'},
                             {name: 't', type: '{Number}', description: 'A float between 0 and 1.'}],
                    returns: [{type: '{Number}', description: 'Returns a number between a and b. How close depends on how close t is to 0 or 1. For example, if t = 0.5, the resulting number will be halfway between a and b.'}]
                },
            ]
        )
    }
}

export default ScriptInfoInterface;
