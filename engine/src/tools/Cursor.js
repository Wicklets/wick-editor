/*
 * Copyright 2020 WICKLETS LLC
 *
 * This file is part of Wick Engine.
 *
 * Wick Engine is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Wick Engine is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
 */

Wick.Tools.Cursor = class extends Wick.Tool {
    /**
     * Creates a cursor tool.
     */
    constructor () {
        super();

        this.name = 'cursor';

        this.SELECTION_TOLERANCE = 3;
        this.CURSOR_DEFAULT = 'cursors/default.png';
        this.CURSOR_SCALE_TOP_RIGHT_BOTTOM_LEFT = 'cursors/scale-top-right-bottom-left.png';
        this.CURSOR_SCALE_TOP_LEFT_BOTTOM_RIGHT = 'cursors/scale-top-left-bottom-right.png';
        this.CURSOR_SCALE_VERTICAL = 'cursors/scale-vertical.png';
        this.CURSOR_SCALE_HORIZONTAL = 'cursors/scale-horizontal.png';
        this.CURSOR_ROTATE_TOP = 'cursors/rotate-top-right.png';
        this.CURSOR_ROTATE_RIGHT = 'cursors/rotate-bottom-right.png';
        this.CURSOR_ROTATE_BOTTOM = 'cursors/rotate-bottom-left.png';
        this.CURSOR_ROTATE_LEFT = 'cursors/rotate-top-left.png';
        this.CURSOR_ROTATE_TOP_RIGHT = 'cursors/rotate-top-right.png';
        this.CURSOR_ROTATE_TOP_LEFT = 'cursors/rotate-top-left.png';
        this.CURSOR_ROTATE_BOTTOM_RIGHT = 'cursors/rotate-bottom-right.png';
        this.CURSOR_ROTATE_BOTTOM_LEFT = 'cursors/rotate-bottom-left.png';
        this.CURSOR_MOVE = 'cursors/move.png';

        this.hitResult = new this.paper.HitResult();
        this.selectionBox = new this.paper.SelectionBox(paper);

        this.selectedItems = [];

        this.currentCursorIcon = '';
    }

    /**
     * Generate the current cursor.
     * @type {string}
     */
    get cursor () {
        return 'url("'+this.currentCursorIcon+'") 32 32, auto';
    }

    onActivate (e) {
        this.selectedItems = [];
    }

    onDeactivate (e) {

    }

    onMouseMove (e) {
        super.onMouseMove(e);

        // Find the thing that is currently under the cursor.
        this.hitResult = this._updateHitResult(e);

        // Update the image being used for the cursor
        this._setCursor(this._getCursor());
    }

    onMouseDown (e) {
        super.onMouseDown(e);

        if(!e.modifiers) e.modifiers = {};

        this.hitResult = this._updateHitResult(e);

        if(this.hitResult.item && this.hitResult.item.data.isSelectionBoxGUI) {
            // Clicked the selection box GUI, do nothing
        } else if(this.hitResult.item && this._isItemSelected(this.hitResult.item)) {
            // We clicked something that was already selected.
            // Shift click: Deselect that item
            if(e.modifiers.shift) {
                this._deselectItem(this.hitResult.item);
                this.fireEvent('canvasModified');
            }
        } else if (this.hitResult.item && this.hitResult.type === 'fill') {
            if(!e.modifiers.shift) {
                // Shift click? Keep everything else selected.
                this._clearSelection();
            }
            // Clicked an item: select that item
            this._selectItem(this.hitResult.item);
            this.fireEvent('canvasModified');
        } else {
            // Nothing was clicked, so clear the selection and start a new selection box
            // (don't clear the selection if shift is held, though)
            if(this._selection.numObjects > 0 && !e.modifiers.shift) {
                this._clearSelection();
                this.fireEvent('canvasModified');
            }

            this.selectionBox.start(e.point);
        }
    }

    onDoubleClick (e) {
        var selectedObject = this._selection.getSelectedObject();
        if(selectedObject && selectedObject instanceof Wick.Clip) {
            // Double clicked a Clip, set the focus to that Clip.
            this.project.focusTimelineOfSelectedClip();
            this.fireEvent('canvasModified');
        } else if (selectedObject && (selectedObject instanceof Wick.Path) && (selectedObject.view.item instanceof paper.PointText)) {
            // Double clicked text, switch to text tool and edit the text item.
            // TODO
        } else if (!selectedObject) {
            // Double clicked the canvas, leave the current focus.
            this.project.focusTimelineOfParentClip();
            this.fireEvent('canvasModified');
        }
    }

    onMouseDrag (e) {
        if(!e.modifiers) e.modifiers = {};

        this.__isDragging = true;

        if(this.hitResult.item && this.hitResult.item.data.isSelectionBoxGUI) {
            // Update selection drag
            if(!this._widget.currentTransformation) {
                this._widget.startTransformation(this.hitResult.item);
            }
            this._widget.updateTransformation(this.hitResult.item, e);
        } else if (this.selectionBox.active) {
            // Selection box is being used, update it with a new point
            this.selectionBox.drag(e.point);
        } else if(this.hitResult.item && this.hitResult.type === 'fill') {
            // We're dragging the selection itself, so move the whole item.
            if(!this._widget.currentTransformation) {
                this._widget.startTransformation(this.hitResult.item);
            }
            this._widget.updateTransformation(this.hitResult.item, e);
        } else {
            this.__isDragging = false;
        }
    }

    onMouseUp (e) {
        if(!e.modifiers) e.modifiers = {};

        if(this.selectionBox.active) {
            // Finish selection box and select objects touching box (or inside box, if alt is held)
            this.selectionBox.mode = e.modifiers.alt ? 'contains' : 'intersects';
            this.selectionBox.end(e.point);

            if(!e.modifiers.shift) {
                this._selection.clear();
            }

            this.selectionBox.items.filter(item => {
                return item.data.wickUUID;
            }).forEach(item => {
                this._selectItem(item);
            });

            // Only modify the canvas if you actually selected something.
            if (this.selectionBox.items.length > 0) {
                this.fireEvent('canvasModified');
            }

        } else if (this._selection.numObjects > 0) {
            if(this.__isDragging) {
                this.__isDragging = false;
                this.project.tryToAutoCreateTween();
                this._widget.finishTransformation();
                this.fireEvent('canvasModified');
            }
        }
    }

    _updateHitResult (e) {
        var newHitResult = this.paper.project.hitTest(e.point, {
            fill: true,
            stroke: true,
            curves: true,
            segments: true,
            tolerance: this.SELECTION_TOLERANCE,
            match: (result => {
                return result.item !== this.hoverPreview
                    && !result.item.data.isBorder;
            }),
        });
        if(!newHitResult) newHitResult = new this.paper.HitResult();

        if(newHitResult.item && !newHitResult.item.data.isSelectionBoxGUI) {
            // You can't select children of compound paths, you can only select the whole thing.
            if (newHitResult.item.parent.className === 'CompoundPath') {
                newHitResult.item = newHitResult.item.parent;
            }

            // You can't select individual children in a group, you can only select the whole thing.
            if (newHitResult.item.parent.parent) {
                newHitResult.type = 'fill';

                while (newHitResult.item.parent.parent) {
                    newHitResult.item = newHitResult.item.parent;
                }
            }

            // this.paper.js has two names for strokes+curves, we don't need that extra info
            if(newHitResult.type === 'stroke') {
                newHitResult.type = 'curve';
            }

            // Mousing over rasters acts the same as mousing over fills.
            if(newHitResult.type === 'pixel') {
                newHitResult.type = 'fill';
            };

            // Disable curve and segment selection. (this was moved to the PathCursor)
            if(newHitResult.type === 'segment' || newHitResult.type === 'curve') {
                newHitResult.type = 'fill';
            };
        }

        return newHitResult;
    }

    _getCursor () {
        if(!this.hitResult.item) {
            return this.CURSOR_DEFAULT;
        } else if (this.hitResult.item.data.isSelectionBoxGUI) {
            // Don't show any custom cursor if the mouse is over the border, the border does nothing
            if(this.hitResult.item.name === 'border') {
                return this.CURSOR_DEFAULT;
            }

            // Calculate the angle in which the scale handle scales the selection.
            // Use that angle to determine the cursor graphic to use.

            // Here is a handy diagram showing the cursors that correspond to the angles:

            // 315       0       45
            //     o-----o-----o
            //     |           |
            //     |           |
            // 270 o           o 90
            //     |           |
            //     |           |
            //     o-----o-----o
            // 225      180      135

            var baseAngle = {
                topCenter: 0,
                topRight: 45,
                rightCenter: 90,
                bottomRight: 135,
                bottomCenter: 180,
                bottomLeft: 225,
                leftCenter: 270,
                topLeft: 315,
            }[this.hitResult.item.data.handleEdge];

            var angle = baseAngle + this._widget.rotation;
            // It makes angle math easier if we dont allow angles >360 or <0 degrees:
            if(angle < 0) angle += 360;
            if(angle > 360) angle -= 360;

            // Round the angle to the nearest 45 degree interval.
            var angleRoundedToNearest45 = Math.round(angle / 45) * 45;
            angleRoundedToNearest45 = Math.round(angleRoundedToNearest45); // just incase of float weirdness
            angleRoundedToNearest45 = ''+angleRoundedToNearest45; // convert to string

            // Now we know which of eight directions the handle is pointing, so we choose the correct cursor
            if (this.hitResult.item.data.handleType === 'scale') {
                var cursorGraphicFromAngle = {
                    '0': this.CURSOR_SCALE_VERTICAL,
                    '45': this.CURSOR_SCALE_TOP_RIGHT_BOTTOM_LEFT,
                    '90': this.CURSOR_SCALE_HORIZONTAL,
                    '135': this.CURSOR_SCALE_TOP_LEFT_BOTTOM_RIGHT,
                    '180': this.CURSOR_SCALE_VERTICAL,
                    '225': this.CURSOR_SCALE_TOP_RIGHT_BOTTOM_LEFT,
                    '270': this.CURSOR_SCALE_HORIZONTAL,
                    '315': this.CURSOR_SCALE_TOP_LEFT_BOTTOM_RIGHT,
                    '360': this.CURSOR_SCALE_VERTICAL,
                }[angleRoundedToNearest45];

                return cursorGraphicFromAngle;
            } else if (this.hitResult.item.data.handleType === 'rotation') {
                var cursorGraphicFromAngle = {
                    '0': this.CURSOR_ROTATE_TOP,
                    '45': this.CURSOR_ROTATE_TOP_RIGHT,
                    '90': this.CURSOR_ROTATE_RIGHT,
                    '135': this.CURSOR_ROTATE_BOTTOM_RIGHT,
                    '180': this.CURSOR_ROTATE_BOTTOM,
                    '225': this.CURSOR_ROTATE_BOTTOM_LEFT,
                    '270': this.CURSOR_ROTATE_LEFT,
                    '315': this.CURSOR_ROTATE_TOP_LEFT,
                    '360': this.CURSOR_ROTATE_TOP,
                }[angleRoundedToNearest45];

                return cursorGraphicFromAngle;
            }
        } else {
            if(this.hitResult.type === 'fill') {
                return this.CURSOR_MOVE;
            }
        }
    }

    _setCursor (cursor) {
        this.currentCursorIcon = cursor;
    }

    get _selection () {
        return this.project.selection;
    }

    get _widget () {
        return this._selection.view.widget;
    }

    _clearSelection () {
        this._selection.clear();
    }

    _selectItem (item) {
        var object = this._wickObjectFromPaperItem(item);
        this._selection.select(object);
    }

    _deselectItem (item) {
        var object = this._wickObjectFromPaperItem(item);
        this._selection.deselect(object);
    }

    _isItemSelected (item) {
        var object = this._wickObjectFromPaperItem(item);
        return object.isSelected;
    }

    _wickObjectFromPaperItem (item) {
        var uuid = item.data.wickUUID;
        if(!uuid) {
            console.error('WARNING: _wickObjectFromPaperItem: item had no wick UUID. did you try to select something that wasnt created by a wick view? is the view up-to-date?');
            console.log(item);
        }
        return Wick.ObjectCache.getObjectByUUID(uuid);
    }
}
