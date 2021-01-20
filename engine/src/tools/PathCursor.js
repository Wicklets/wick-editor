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

Wick.Tools.PathCursor = class extends Wick.Tool {
    constructor () {
        super();

        this.name = 'pathcursor';

        this.SELECTION_TOLERANCE = 3;
        this.CURSOR_DEFAULT = 'cursors/default.png';
        this.CURSOR_SEGMENT = 'cursors/segment.png';
        this.CURSOR_CURVE = 'cursors/curve.png';
        this.HOVER_PREVIEW_SEGMENT_STROKE_COLOR = 'rgba(100,150,255,1.0)';
        this.HOVER_PREVIEW_SEGMENT_STROKE_WIDTH = 1.5;
        this.HOVER_PREVIEW_SEGMENT_FILL_COLOR = '#ffffff';
        this.HOVER_PREVIEW_SEGMENT_RADIUS = 5;
        this.HOVER_PREVIEW_CURVE_STROKE_WIDTH = 2;
        this.HOVER_PREVIEW_CURVE_STROKE_COLOR = this.HOVER_PREVIEW_SEGMENT_STROKE_COLOR;

        this.hitResult = new this.paper.HitResult();

        this.draggingCurve = new this.paper.Curve();
        this.draggingSegment = new this.paper.Segment();
        this.hoverPreview = new this.paper.Item({insert:false});
        this.detailedEditing = null;

        this.currentCursorIcon = '';
    }

    get doubleClickEnabled () {
        return true;
    }

    get cursor () {
        return 'url("'+this.currentCursorIcon+'") 32 32, auto';
    }

    onActivate (e) {
    }

    onDeactivate (e) {
        this._leaveDetailedEditing();
    }

    onMouseMove (e) {
        super.onMouseMove(e);

        // Remove the hover preview, a new one will be generated if needed
        this.hoverPreview.remove();

        // Find the thing that is currently under the cursor.
        this.hitResult = this._updateHitResult(e);

        // Update the image being used for the cursor
        this._setCursor(this._getCursor());

        // Regen hover preview
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
        super.onMouseDown(e);

        if(!e.modifiers) e.modifiers = {};

        this.hitResult = this._updateHitResult(e);

        if (this.detailedEditing !== null && !(
            this.hitResult.item || (
                this.hitResult.type && this.hitResult.type.startsWith('handle')))) {
            // Clicked neither on the currently edited path nor on a handle.
            this._leaveDetailedEditing();
        }

        if (this.hitResult.item && this.hitResult.type === 'curve') {
            // Clicked a curve, start dragging it
            this.draggingCurve = this.hitResult.location.curve;
        } else if (this.hitResult.item && this.hitResult.type === 'segment') {
            if(e.modifiers.alt || 
                e.modifiers.command ||
                e.modifiers.control ||
                e.modifiers.option ||
                e.modifiers.shift) {
                this.hitResult.segment.remove();
            }
        }
    }

    onDoubleClick (e) {
        this.hitResult = this._updateHitResult(e);

        if (this.detailedEditing == null) {
            // If detailed editing is off, turn it on for this path.
            this.detailedEditing = this.hitResult.item;
            this.detailedEditing.setFullySelected(true);

        } else if (!this.hitResult.item) {
            // If detailed editing is on for some path, but the user
            // double clicked somewhere else, turn it off.
            this._leaveDetailedEditing();

        } else if (this.hitResult.item && this.hitResult.type === 'curve') {
            
            var location = this.hitResult.location;
            var path = this.hitResult.item;

            var addedPoint = path.insert(location.index + 1, e.point);

            if (!e.modifiers.shift) {
                addedPoint.smooth()

                var handleInMag = Math.sqrt(
                    addedPoint.handleIn.x*addedPoint.handleIn.x+
                    addedPoint.handleIn.y+addedPoint.handleIn.y)
                var handleOutMag = Math.sqrt(
                    addedPoint.handleOut.x*addedPoint.handleOut.x+
                    addedPoint.handleOut.y+addedPoint.handleOut.y)

                if(handleInMag > handleOutMag) {
                    var avgMag = handleOutMag;
                    addedPoint.handleIn.x = -addedPoint.handleOut.x*1.5;
                    addedPoint.handleIn.y = -addedPoint.handleOut.y*1.5;
                    addedPoint.handleOut.x *= 1.5;
                    addedPoint.handleOut.y *= 1.5;
                } else {
                    var avgMag = handleInMag;
                    addedPoint.handleOut.x = -addedPoint.handleIn.x*1.5;
                    addedPoint.handleOut.y = -addedPoint.handleIn.y*1.5;
                    addedPoint.handleIn.x *= 1.5;
                    addedPoint.handleIn.y *= 1.5;
                }
            }

            if (this.detailedEditing !== null) {
                path.setFullySelected(true);
            }

        } else if (this.hitResult.item && this.hitResult.type === 'segment') {
            var hix = this.hitResult.segment.handleIn.x;
            var hiy = this.hitResult.segment.handleIn.y;
            var hox = this.hitResult.segment.handleOut.x;
            var hoy = this.hitResult.segment.handleOut.y;
            if(hix === 0 && hiy === 0 && hix === 0 && hiy === 0) {
                this.hitResult.segment.smooth();
            } else {
                this.hitResult.segment.handleIn.x = 0;
                this.hitResult.segment.handleIn.y = 0;
                this.hitResult.segment.handleOut.x = 0;
                this.hitResult.segment.handleOut.y = 0;
            }
        }

    }

    onMouseDrag (e) {
        if(!e.modifiers) e.modifiers = {};

        if(this.hitResult.item && this.hitResult.type === 'segment') {
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

        if (this.hitResult.type && this.hitResult.type.startsWith('handle')) {
            var otherHandle;
            var handle;
            if(this.hitResult.type === 'handle-in') {
                handle = this.hitResult.segment.handleIn;
                otherHandle = this.hitResult.segment.handleOut;
            } else if (this.hitResult.type === 'handle-out') {
                handle = this.hitResult.segment.handleOut;
                otherHandle = this.hitResult.segment.handleIn;
            }

            handle.x += e.delta.x;
            handle.y += e.delta.y;
            if (!e.modifiers.shift) {
                otherHandle.x -= e.delta.x;
                otherHandle.y -= e.delta.y;
            }
        }
    }

    onMouseUp (e) {
        if (this.hitResult.type === 'segment' || this.hitResult.type === 'curve') {
            this.fireEvent({eventName: 'canvasModified', actionName:'pathcursor'});
        }
    }

    onKeyDown(e) {
        if (this.detailedEditing !== null && e.key == "<") {
            var wick = Wick.ObjectCache.getObjectByUUID(
                this._getWickUUID(this.detailedEditing));
            var path = wick._view._item;
            path.closed = !path.closed;
            this.fireEvent('canvasModified');
        }
    }

    _updateHitResult (e) {
        var newHitResult = this.paper.project.hitTest(e.point, {
            fill: true,
            stroke: true,
            curves: true,
            segments: true,
            handles: this.detailedEditing !== null,
            tolerance: this.SELECTION_TOLERANCE,
            match: (result => {
                return result.item !== this.hoverPreview
                    && !result.item.data.isBorder;
            }),
        });
        if(!newHitResult) newHitResult = new this.paper.HitResult();

        if (this.detailedEditing !== null) {
            if (this._getWickUUID(newHitResult.item) !== this._getWickUUID(this.detailedEditing)) {
                // Hits an item, but not the one currently in detail edit - handle as a click with no hit.
                return new this.paper.HitResult();
            }

            if (newHitResult.item && newHitResult.type.startsWith('handle')) {
                // If this a click on a handle, do not apply hit type prediction below.
                return newHitResult;
            }
        }

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
        }

        return newHitResult;
    }

    _getCursor () {
        if(!this.hitResult.item) {
            return this.CURSOR_DEFAULT;
        } else if (this.hitResult.type === 'curve') {
            return this.CURSOR_CURVE;
        } else if (this.hitResult.type === 'segment') {
            return this.CURSOR_SEGMENT;
        }
    }

    _setCursor (cursor) {
        this.currentCursorIcon = cursor;
    }

    _leaveDetailedEditing () {
        if (this.detailedEditing !== null) {
            this.paper.project.deselectAll();

            this.paper.project.activeLayer.children.forEach(function (child) {
                if (child.wick && !child.wick.isSymbol) {
                    child.fullySelected = false;
                }
            });

            this.detailedEditing = null;

            this.fireEvent('canvasModified');
        }
    }

    _getWickUUID (item) {
        if (item) {
            return item.data.wickUUID;
        } else {
            return undefined;
        }
    }
}
