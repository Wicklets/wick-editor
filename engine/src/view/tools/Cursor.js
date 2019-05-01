/*
 * Copyright 2019 WICKLETS LLC
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
     * Creates a pencil tool.
     */
    constructor () {
        super();

        this.SELECTION_TOLERANCE = 3;
        this.CURSOR_DEFAULT = 'cursors/default.png';
        this.CURSOR_SCALE_TOP_RIGHT_BOTTOM_LEFT = 'cursors/scale-top-right-bottom-left.png';
        this.CURSOR_SCALE_TOP_LEFT_BOTTOM_RIGHT = 'cursors/scale-top-left-bottom-right.png';
        this.CURSOR_SCALE_VERTICAL = 'cursors/scale-vertical.png';
        this.CURSOR_SCALE_HORIZONTAL = 'cursors/scale-horizontal.png';
        this.CURSOR_ROTATE_TOP = 'cursors/rotate-top.png';
        this.CURSOR_ROTATE_RIGHT = 'cursors/rotate-right.png';
        this.CURSOR_ROTATE_BOTTOM = 'cursors/rotate-bottom.png';
        this.CURSOR_ROTATE_LEFT = 'cursors/rotate-left.png';
        this.CURSOR_ROTATE_TOP_RIGHT = 'cursors/rotate-top-right.png';
        this.CURSOR_ROTATE_TOP_LEFT = 'cursors/rotate-top-left.png';
        this.CURSOR_ROTATE_BOTTOM_RIGHT = 'cursors/rotate-bottom-right.png';
        this.CURSOR_ROTATE_BOTTOM_LEFT = 'cursors/rotate-bottom-left.png';
        this.CURSOR_MOVE = 'cursors/move.png';
        this.CURSOR_SEGMENT = 'cursors/segment.png';
        this.CURSOR_CURVE = 'cursors/curve.png';
        this.HOVER_PREVIEW_SEGMENT_STROKE_COLOR = 'rgba(100,150,255,1.0)';
        this.HOVER_PREVIEW_SEGMENT_STROKE_WIDTH = 1.5;
        this.HOVER_PREVIEW_SEGMENT_FILL_COLOR = '#ffffff';
        this.HOVER_PREVIEW_SEGMENT_RADIUS = 5;
        this.HOVER_PREVIEW_CURVE_STROKE_WIDTH = 2;
        this.HOVER_PREVIEW_CURVE_STROKE_COLOR = this.HOVER_PREVIEW_SEGMENT_STROKE_COLOR;

        this.hitResult = new this.paper.HitResult();
        this.selectionBox = new this.paper.SelectionBox(paper);

        this.draggingCurve = new this.paper.Curve();
        this.draggingSegment = new this.paper.Segment();
        this.hoverPreview = new this.paper.Item({insert:false});

        this.selectPoints = true;
        this.selectCurves = true;

        this.selectedItems = [];

        this.currentCursorIcon = '';

        this.guiLayer = new this.paper.Layer();
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

        // Remove the hover preview, a new one will be generated if needed
        this.hoverPreview.remove();

        // Find the thing that is currently under the cursor.
        this.hitResult = this._updateHitResult(e);

        // Update the image being used for the cursor
        this._setCursor(this._getCursor());

        if(this.hitResult.type === 'segment' && !this.hitResult.item.data.isSelectionBoxGUI) {
            // Hovering over a segment, draw a circle where the segment is
            this.hoverPreview = new this.paper.Path.Circle(this.hitResult.segment.point, this.HOVER_PREVIEW_SEGMENT_RADIUS/this.paper.view.zoom);
            this.hoverPreview.strokeColor = this.HOVER_PREVIEW_SEGMENT_STROKE_COLOR;
            this.hoverPreview.strokeWidth = this.HOVER_PREVIEW_SEGMENT_STROKE_WIDTH;
            this.hoverPreview.fillColor = this.HOVER_PREVIEW_SEGMENT_FILL_COLOR;
        } else if (this.hitResult.type === 'curve' && !this.hitResult.item.data.isSelectionBoxGUI) {
            // Hovering over a curve, render a copy of the curve that can be bent
            this.hoverPreview = new this.paper.Path();
            this.hoverPreview.strokeWidth = this.HOVER_PREVIEW_CURVE_STROKE_WIDTH;
            this.hoverPreview.strokeColor = this.HOVER_PREVIEW_CURVE_STROKE_COLOR;
            this.hoverPreview.add(new this.paper.Point(this.hitResult.location.curve.point1));
            this.hoverPreview.add(new this.paper.Point(this.hitResult.location.curve.point2));
            this.hoverPreview.segments[0].handleOut = this.hitResult.location.curve.handle1;
            this.hoverPreview.segments[1].handleIn = this.hitResult.location.curve.handle2;
        }
        this.hoverPreview.data.wickType = 'gui';
    }

    onMouseDown (e) {
        this.hitResult = this._updateHitResult(e);

        if(this.hitResult.item && this.hitResult.item.data.isSelectionBoxGUI) {
            // The selection box was clicked
        } else /*if(this.paper.selection.isItemSelected(this.hitResult.item)) {
            // We clicked something that was already selected.
            // Shift click: Deselect that item
            // TODO Replace
        } else */if (this.hitResult.item && this.hitResult.type === 'fill') {
            // Clicked an item: select that item
            // Shift click? Keep everything else selected.
            // TODO Replace
        } else if (this.hitResult.item && this.hitResult.type === 'curve') {
            // Clicked a curve, start dragging it
            this.draggingCurve = this.hitResult.location.curve;
        } else if (this.hitResult.item && this.hitResult.type === 'segment') {

        } else {
            //if(this.paper.selection.items.length > 1) {
                // Nothing was clicked, so clear the selection and start a new selection box
                // TODO Replace
            //}

            this.selectionBox.start(e.point);
        }
    }

    onMouseDrag (e) {
        if(this.hitResult.item && this.hitResult.item.data.isSelectionBoxGUI) {
            // Drag a handle of the selection box.
            // These can scale and rotate the selection.
            // TODO replace.
        } else if (this.selectionBox.active) {
            // Selection box is being used, update it with a new point
            this.selectionBox.drag(e.point);
        } else if(this.hitResult.item && this.hitResult.type === 'fill') {
            // We're dragging the selection itself, so move the whole item.
            // TODO Replace
        } else if(this.hitResult.item && this.hitResult.type === 'segment') {
            // We're dragging an individual point, so move the point.
            this.hitResult.segment.point = this.hitResult.segment.point.add(e.delta);
            this.hoverPreview.position = this.hitResult.segment.point;
        } else if(this.hitResult.item && this.hitResult.type === 'curve') {
            // We're dragging a curve, so bend the curve.
            var segment1 = this.draggingCurve.segment1;
            var segment2 = this.draggingCurve.segment2;
            var handleIn = segment1.handleOut;
            var handleOut = segment2.handleIn;

            if(handleIn.x === 0 && handleIn.y === 0) {
                handleIn.x = (segment2.point.x - segment1.point.x) / 4;
                handleIn.y = (segment2.point.y - segment1.point.y) / 4;
            }
            if(handleOut.x === 0 && handleOut.y === 0) {
                handleOut.x = (segment1.point.x - segment2.point.x) / 4;
                handleOut.y = (segment1.point.y - segment2.point.y) / 4;
            }

            handleIn.x += e.delta.x;
            handleIn.y += e.delta.y;
            handleOut.x += e.delta.x;
            handleOut.y += e.delta.y;

            // Update the hover preview to match the curve we just changed
            this.hoverPreview.segments[0].handleOut = this.draggingCurve.handle1;
            this.hoverPreview.segments[1].handleIn = this.draggingCurve.handle2;
        }
    }

    onMouseUp (e) {
        if(this.selectionBox.active) {
            // Finish selection box and select objects touching box (or inside box, if alt is held)
            this.selectionBox.mode = e.modifiers.alt ? 'contains' : 'intersects';
            this.selectionBox.end(e.point);
            // TODO Replace
        } else {
            this.fireEvent('canvasModified');
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
            })
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
            }

            // Disable curve selection unless selectCurves is true.
            if(!this.selectCurves && newHitResult.type === 'curve') {
                newHitResult.type = 'fill';
            }

            // Disable segment selection unless selectPoints is true.
            if(!this.selectPoints && newHitResult.type === 'segment') {
                newHitResult.type = 'fill';
            }

            // You can't drag segments and curves of a selected object.
            // TODO Replace.
            /*
            if(this.paper.selection.isItemSelected(newHitResult.item)) {
                newHitResult.type = 'fill';
            }
            */
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

            // Flip angles if selection is flipped horizontally/vertically
            /*
            if(this.paper.selection._transform.scaleX < 0) {
                baseAngle = -baseAngle + 360;
            }
            if(this.paper.selection._transform.scaleY < 0) {
                baseAngle = -baseAngle + 180;
            }

            var angle = baseAngle + this.paper.selection.rotation;
            if(angle < 0) angle += 360;
            if(angle > 360) angle -= 360; // Makes angle math easier if we dont allow angles >360 or <0 degrees
            */
            // TODO Replace.

            var angle = 0;

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
            } else if (this.hitResult.type === 'curve') {
                return this.CURSOR_CURVE;
            } else if (this.hitResult.type === 'segment') {
                return this.CURSOR_SEGMENT;
            }
        }
    }

    _setCursor (cursor) {
        this.currentCursorIcon = cursor;
    }
}
