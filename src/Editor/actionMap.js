/**
 * Maps actions to editor core functions for use throughout the editor.
 * @extends Object
 */
class ActionMapInterface extends Object {
  constructor(editor) {
    super();
    this.editor = editor;

    this.createEditorActions();
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
        id: 'action-flip-horizontal',
      },
      flipVertical: {
        icon: 'flipVertical',
        tooltip: 'Flip Vertical',
        action: this.editor.flipSelectedVertical,
        id: 'action-flip-vertical',
      },
      deleteSelection: {
        icon: 'delete',
        tooltip: 'Delete Selection',
        action: this.editor.deleteSelectedObjects,
        id: 'action-delete',
      },
      sendToBack: {
        icon: 'sendToBack',
        tooltip: 'Send to Back',
        action: this.editor.sendSelectionToBack,
        id: 'action-send-to-back',
      },
      sendToFront: {
        icon: 'bringToFront',
        tooltip: 'Bring to Front',
        action: this.editor.sendSelectionToFront,
        id: 'action-send-to-front',
      },
      moveBackward: {
        icon: 'sendBackwards',
        tooltip: 'Send Backward',
        action: this.editor.moveSelectionBackwards,
        id: 'action-move-backward',
      },
      moveForward: {
        icon: 'bringForwards',
        tooltip: 'Send Forward',
        action: this.editor.moveSelectionForwards,
        id: 'action-move-forward',
      },
      createGroupFromSelection: {
        icon: 'createGroup',
        tooltip: 'Create Group from Selection(NYI)',
        action: () => console.error('NYI'),
        id: 'action-create-group',
      },
      editCode: {
        icon: 'script',
        tooltip: 'Add or Edit Code',
        action: this.editor.toggleCodeEditor,
        id: 'action-toggle-code-editor',
      },
      editTimeline: {
        icon: 'timeline',
        tooltip: 'Edit Timeline',
        action: this.editor.focusTimelineOfSelectedObject,
        id: 'action-edit-timeline',
      },
      breakApart: {
        icon: 'breakApart',
        tooltip: 'Break Apart',
        action: this.editor.breakApartSelection,
        id: 'action-break-apart',
      },
      addTweenToSelection: {
        icon: 'addTween',
        tooltip: 'Add Tween to Frame(NYI)',
        action: () => console.error('NYI'),
        id: 'action-add-tween',
      },
      makeInteractive: {
        icon: 'symbol',
        tooltip: 'Make Interactive and Animated',
        action: this.editor.beginSymbolCreation,
        id: 'action-convert-to-symbol',
      },
      returnToParentTimeline: {
        icon: 'leaveUp',
        tooltip: 'Return to Parent Timeline',
        action: this.editor.focusTimelineOfParentClip,
        id: 'action-return-to-parent-timeline',
      }
    }
  }
}

export default ActionMapInterface;
