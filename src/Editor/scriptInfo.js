
class ScriptInfoInterface extends Object {
    get allScripts ()  {
        return [
            'load', 
            'update',
            'unload',
            'mouseenter',
            'mouseleave',
            'mousepressed',
            'mousedown',
            'mousereleased',
            'mousedrag',
            'mouseclick',
            'keypressed',
            'keyreleased',
            'keydown',
        ]
    }

    get scriptsByType () {
        return {
            'Timeline': ['load', 'update', 'unload'], 
            'Mouse': ['mouseenter', 'mouseleave', 'mousepressed', 'mousedown', 'mousereleased', 'mousedrag', 'mouseclick'],
            'Keyboard': ['keypressed', 'keyreleased', 'keydown'],
        }
    }

    get scriptDescriptions () {
        return {
            'load' : 'Once, when the frame is entered',
            'unload' : 'Once, when the frame is exited',
            'update' : 'Every tick, while the project is playing',
            'mouseenter' : 'Once, when the mouse enters the object',
            'mouseleave' : 'Once, when the mouse leaves the object',
            'mousepressed' : 'Once, when the mouse presses down on the object',
            'mousedown' : 'Every tick, when the mouse is down on the object',
            'mousereleased' : 'Once, when the mouse is released over the object',
            'mousedrag' : 'Every tick, when the mouse moves while down',
            'mouseclick' : 'Once, when the mouse goes down then up over an object',
            'keypressed' : 'Once, when any key is pushed down', 
            'keyreleased' : 'Once, when any key is released', 
            'keydown' : 'Every tick, when any key is down',
        }
    }
}

export default ScriptInfoInterface;