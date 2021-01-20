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
      sendToBack: {
        icon: 'sendToBack',
        tooltip: 'Send to Back',
        action: this.editor.sendSelectionToBack,
        id: 'action-send-to-back',
      },
      sendToFront: {
        icon: 'bringToFront',
        tooltip: 'Send To Front',
        action: this.editor.sendSelectionToFront,
        id: 'action-send-to-front',
      },
      sendBackward: {
        icon: 'sendBackwards',
        tooltip: 'Send Backward',
        action: this.editor.moveSelectionBackwards,
        id: 'action-move-backward',
      },
      sendForward: {
        icon: 'bringForwards',
        tooltip: 'Send Forward',
        action: this.editor.moveSelectionForwards,
        id: 'action-move-forward',
      },
      booleanUnite: {
        icon: 'unite',
        tooltip: 'Unite',
        action: this.editor.booleanUnite,
        id: 'action-boolean-unite',
      },
      booleanSubtract: {
        icon: 'subtract',
        tooltip: 'Subtract',
        action: this.editor.booleanSubtract,
        id: 'action-boolean-subtract',
      },
      booleanIntersect: {
        icon: 'intersect',
        tooltip: 'Intersect',
        action: this.editor.booleanIntersect,
        id: 'action-boolean-intersect',
      },
      createGroupFromSelection: {
        icon: 'createGroup',
        tooltip: 'Create Group from Selection(NYI)',
        action: () => console.error('NYI'),
        id: 'action-create-group',
      },
      editCode: {
        icon: 'script',
        tooltip: 'Edit Code',
        action: this.editor.toggleCodeEditor,
        id: 'action-toggle-code-editor',
      },
      editTimeline: {
        icon: 'timeline-dark',
        tooltip: 'Edit Timeline',
        action: this.editor.focusTimelineOfSelectedObject,
        id: 'action-edit-timeline',
        color: 'active-green'
      },
      breakApart: {
        icon: 'breakApart-dark',
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
      makeAnimated: {
        icon: 'animated',
        tooltip: 'Make Animated',
        action: this.editor.beginMakeAnimatedProcess,
        id: 'action-make-animated',
      },
      makeInteractive: {
        icon: 'symbol',
        tooltip: 'Make Interactive',
        action: this.editor.beginMakeInteractiveProcess,
        id: 'action-make-interactive',
      },
      returnToParentTimeline: {
        icon: 'leaveUp',
        tooltip: 'Return to Parent Timeline',
        action: this.editor.focusTimelineOfParentClip,
        id: 'action-return-to-parent-timeline',
      },
      undo: {
        icon: 'undo',
        tooltip: 'Undo',
        action: this.editor.undoAction,
        id: 'action-undo',
      },
      redo: {
        icon: 'redo',
        tooltip: 'Redo',
        action: this.editor.redoAction,
        id: 'action-redo',
      },
      copy: {
        icon: 'copy',
        tooltip: 'Copy',
        action: this.editor.copySelectionToClipboard,
        id: 'action-copy-to-clipboard',
      },
      paste: {
        icon: 'paste',
        tooltip: 'Paste',
        action: this.editor.pasteFromClipboard,
        id: 'action-paste-from-clipboard',
      },
      delete: {
        icon: 'delete',
        tooltip: 'Delete',
        action: this.editor.deleteSelectedObjects,
        id: 'action-delete-selected-objects',
      },
      showMoreCanvasActions: {
        icon: 'moreactions',
        tooltip: 'Canvas Actions',
        action: this.editor.toggleCanvasActions,
        id: 'action-show-more-canvas-options',
      },
      convertSelectionToButton: {
        icon: 'button-object-dark',
        tooltip: 'Make Button',
        action: this.editor.createButtonFromSelection,
        id: 'action-convert-selection-to-button',
        color: 'active-green'
      },
      convertSelectionToClip: {
        icon: 'clip-object-dark',
        tooltip: 'Make Clip',
        action: this.editor.createClipFromSelection,
        id: 'action-convert-selection-to-clip',
        color: 'active-blue'
      },
      addAssetToCanvas: {
        icon: 'add',
        tooltip: 'Add To Canvas',
        action: this.editor.createInstanceOfSelectedAsset,
        id: 'action-create-instance-of-selected-asset',
        color: 'active-blue'
      },
    }
  }
}

export default ActionMapInterface;
