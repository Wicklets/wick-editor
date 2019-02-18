/**
 * Maps actions to editor core functions for use throughout the editor.
 * @extends Object
 */
class ActionMapInterface extends Object {
  constructor(editor) {
    super();
    this.editor = editor;

    this.createEditorActions();
    this.createActionGroups();
  }

  /**
   * Creates action objects for use around the editor.
   * Action objects must include properties {function}action and a {string}id representing a unique id. Optional properties include a {string}color, {string}icon, and {string}tooltip.
   */
  createEditorActions () {
    this.editorActions =  {
      flipHorizontal: {
        icon: 'flipHorizontal',
        tooltip: 'Flip Horizontal',
        action: this.editor.flipSelectedHorizontal,
        color: 'green',
        id: 'action-flip-horizontal',
      },
      flipVertical: {
        icon: 'flipVertical',
        tooltip: 'Flip Vertical',
        action: this.editor.flipSelectedVertical,
        color: 'green',
        id: 'action-flip-vertical',
      },
      deleteSelection: {
        icon: 'delete',
        tooltip: 'Delete Selection',
        action: this.editor.deleteSelectedObjects,
        color: 'red',
        id: 'action-delete',
      },
      sendToBack: {
        icon: 'sendToBack',
        tooltip: 'Send to Back',
        action: this.editor.sendSelectionToBack,
        color: 'blue',
        id: 'action-send-to-back',
      },
      sendToFront: {
        icon: 'bringToFront',
        tooltip: 'Bring to Front',
        action: this.editor.sendSelectionToFront,
        color: 'blue',
        id: 'action-send-to-front',
      },
      moveBackward: {
        icon: 'sendBackwards',
        tooltip: 'Send Backward',
        action: this.editor.moveSelectionBackwards,
        color: 'blue',
        id: 'action-move-backward',
      },
      moveForward: {
        icon: 'bringForwards',
        tooltip: 'Send Forward',
        action: this.editor.moveSelectionForwards,
        color: 'blue',
        id: 'action-move-forward',
      },
      createGroupFromSelection: {
        icon: 'createGroup',
        tooltip: 'Create Group from Selection(NYI)',
        action: () => console.error('NYI'),
        color: 'yellow',
        id: 'action-create-group',
      },
      toggleCodeEditor: {
        icon: 'script',
        tooltip: 'Toggle Code Editor',
        action: this.editor.toggleCodeEditor,
        color: 'sky',
        id: 'action-toggle-code-editor',
      },
      editClipTimeline: {
        icon: 'timeline',
        tooltip: 'Edit Symbol Timeline',
        action: this.editor.focusTimelineOfSelectedObject,
        color: 'sky',
        id: 'action-edit-timeline',
      },
      breakApart: {
        icon: 'breakApart',
        tooltip: 'Break Apart',
        action: this.editor.breakApartSelection,
        color: 'red',
        id: 'action-break-apart',
      },
      addTweenToSelection: {
        icon: 'addTween',
        tooltip: 'Add Tween to Frame(NYI)',
        action: () => console.error('NYI'),
        color: 'green',
        id: 'action-add-tween',
      },
      createSymbolFromSelection: {
        icon: 'symbol',
        tooltip: 'Create Symbol from Selection',
        action: this.editor.beginSymbolCreation,
        color: 'green',
        id: 'action-convert-to-symbol',
      },
      returnToParentTimeline: {
        icon: 'leaveUp',
        tooltip: 'Return to Parent Timeline',
        action: this.editor.focusTimelineOfParentClip,
        color: 'green',
        id: 'action-return-to-parent-timeline',
      }
    }
  }

  createInspectorActionGroups = () => {
    this.inspectorActionGroups = {
      focus: {
        on: ( () => !(this.editor.project.focus === this.editor.project.root )),
        actions: [
          this.editorActions['returnToParentTimeline'],
        ],
        color: 'red',
      },
      clip: {
        on: ( () => this.editor.getSelectionType() === 'clip' ),
        actions: [
          this.editorActions['editClipTimeline'],
          this.editorActions['toggleCodeEditor'],
        ],
        color: 'green',
      },
      frame: {
        on: ( () => this.editor.getSelectionType() === 'frame' ),
        actions: [
          this.editorActions['addTweenToSelection'],
          this.editorActions['toggleCodeEditor'],
        ],
        color: 'green',
      },
      group: {
        on: ( () => {
          let type = this.editor.getSelectionType();
          return type === 'clip' || type === 'button' || type === 'group';
        }),
        actions: [
          this.editorActions['breakApart'],
        ],
        color: 'red',
      },
      canvasSelectionVisuals: {
        on: ( () => this.editor.getNumCanvasObjectsSelected() > 0 ),
        actions: [
          this.editorActions['createSymbolFromSelection'],
        ],
        color: 'sky',
      },
    }
  }
      // canvasSelectionMovement: {
      //   on: ( () => this.editor.getNumCanvasObjectsSelected() > 0 ),
      //   actions: [
      //     this.editorActions['moveBackward'],
      //     this.editorActions['sendToBack'],
      //     this.editorActions['moveForward'],
      //     this.editorActions['sendToFront'],
      //   ],
      //   color: 'sky',
      // },
      // canvasSelectionVisuals: {
      //   on: ( () => this.editor.getNumCanvasObjectsSelected() > 0 ),
      //   actions: [
      //     this.editorActions['flipHorizontal'],
      //     this.editorActions['flipVertical'],
      //   ],
      //   color: 'sky',
      // },


  /**
   * Creates action groups for use within the editor. Action groups are collections of actions which should be displayed together.
   * Action groups must have an {function}on function, which returns true when an action group should be displayed, and an {object<EditorAction>[]}actions array, which describes all associated actions. Optional properties include {string}color, which is used to color code entire Action groups.
   */
  createActionGroups = () => {
    this.createInspectorActionGroups();
  }
}

export default ActionMapInterface;
