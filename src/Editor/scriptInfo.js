
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
            'mouseenter' : 'Once, when the mouse enters the object',
            'mouseleave' : 'Once, when the mouse leaves the object',
            'mousehover' : 'Every tick, when the mouse is over the object',
            'mousepressed' : 'Once, when the mouse presses down on the object',
            'mousedown' : 'Every tick, when the mouse is down on the object',
            'mousereleased' : 'Once, when the mouse is released over the object',
            'mousedrag' : 'Every tick, when the mouse moves while down',
            'mouseclick' : 'Once, when the mouse goes down then up over an object',
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
            'Timeline' : this.timelineReference,
            'Object' : this.objectReference,
            'Input' : this.inputReference,
            'Project' : this.projectReference,
            'Random' : this.randomReference,
            'Sound' : this.soundReference,
            'Event' : this.eventReference,
        }
    }

    get timelineReference () {
        return (
            [
                {
                    name: 'play',
                    snippet: 'play()',
                    description: 'Plays the parent timeline that this object belongs to.',
                },
                {
                    name: 'stop',
                    snippet: 'stop()',
                    description: 'Stops the parent timeline that this object belongs to.',
                },
                {
                    name: 'gotoAndPlay',
                    snippet: 'gotoAndPlay(1)',
                    description: 'Moves the playhead to a frame on the timeline that this object belongs to, and plays that timeline.',
                    params: [{name: 'frame', type: '{string|Number}'}],
                },
                {
                    name: 'gotoAndStop',
                    snippet: 'gotoAndStop(1)',
                    description: 'Moves the playhead to a frame on the timeline that this object belongs to, and stops that timeline.',
                    params: [{name: 'frame', type: '{string|Number}'}],
                },
                {
                    name: 'gotoNextFrame',
                    snippet: 'gotoNextFrame()',
                    description: 'Moves the playhead to the next frame on the timeline that this object belongs to.',
                },
                {
                    name: 'gotoPrevFrame',
                    snippet: 'gotoPrevFrame()',
                    description: 'Moves the playhead to the previous frame on the timeline that this object belongs to.',
                }
            ]
        );
    }

    get objectReference () {
        return (
            [
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
                    name: 'parent',
                    snippet: 'this.parent',
                    description: 'Returns the object that owns the calling object.',
                },
                {
                    name: 'hitTest',
                    snippet: 'this.hitTest(that)',
                    description: 'Determines if the hitboxes of two objects overlap.',
                    param: [{name: 'that', type: '{string}'}],
                    returns: [{type: 'bool', description: 'Returns true if the given object intersects this object.'}],
                    deprecated: true,
                },
            ]
        );
    }

    get soundReference () {
        return (
            [
                {
                    name: 'playSound',
                    snippet: 'playSound("sound.mp3")',
                    description: 'Plays a sound in the asset library.',
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
                    snippet: 'isMouseDown',
                    description: 'True if the mouse is currently pressed down.',
                },
                {
                    name: 'isKeyDown',
                    snippet: 'isKeyDown("a")',
                    description: 'Returns true if the given key is currently down.',
                    param: [{name: 'key', type: '{string}'}],
                    returns: [{type: 'bool', description: 'True if passed key is down.'}],
                },
                {
                    name: 'isKeyJustPressed',
                    snippet: 'isKeyJustPressed("a")',
                    description: 'Returns true if the given key was pressed within the last tick.',
                    param: [{name: 'key', type: '{string}'}],
                    returns: [{type: 'bool', description: 'True if passed key was pressed in the last frame.'}],
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
                    snippet: "this.onEvent('<EVENT_FN>', function () {\n  //Add code here!\n});".replace('<EVENT_FN>', key),
                    descriptions: descriptions[key],
                });
            }
        }); 

        return events;
    }
}

export default ScriptInfoInterface;
