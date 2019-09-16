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

Wick.GUIElement.Tween = class extends Wick.GUIElement {
    constructor (model) {
        super(model);

        this.canAutoScrollX = true;

        this._ghost = null;
    }

    draw () {
        super.draw();

        var ctx = this.ctx;

        // Tween diamond
        ctx.save();
        ctx.rotate(Math.PI / 4);
            var r = Wick.GUIElement.TWEEN_DIAMOND_RADIUS;
            if(this.mouseState === 'over') {
                ctx.fillStyle = Wick.GUIElement.TWEEN_HOVER_COLOR_1;
            } else {
                ctx.fillStyle = Wick.GUIElement.TWEEN_FILL_COLOR_1;
            }
            ctx.beginPath();
            ctx.roundRect(-r, -r, r*2, r*2, 3);
            ctx.fill();
        ctx.restore();

        // Tween diamond right half
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, -30, 30, 60);
        ctx.clip();
        ctx.rotate(Math.PI / 4);
            var r = Wick.GUIElement.TWEEN_DIAMOND_RADIUS;
            if(this.mouseState === 'over') {
                ctx.fillStyle = Wick.GUIElement.TWEEN_HOVER_COLOR_2;
            } else {
                ctx.fillStyle = Wick.GUIElement.TWEEN_FILL_COLOR_2;
            }
            ctx.beginPath();
            ctx.roundRect(-r, -r, r*2, r*2, 3);
            ctx.fill();
        ctx.restore();

        // Selection border

        if (this.model.isSelected) {
            ctx.save();
            ctx.rotate(Math.PI / 4);
                var r = Wick.GUIElement.TWEEN_DIAMOND_RADIUS;
                ctx.strokeStyle = Wick.GUIElement.SELECTED_ITEM_BORDER_COLOR;
                ctx.lineWidth = Wick.GUIElement.FRAME_HIGHLIGHT_STROKEWIDTH;
                ctx.beginPath();
                ctx.roundRect(-r, -r, r*2, r*2, 3);
                ctx.stroke();
            ctx.restore();
        }

        // Tween arrows
        var linePadding = 18;
        var nextTween = this.model.getNextTween();
        if(nextTween) {
            var nextTweenGridPosition = nextTween.playheadPosition - this.model.playheadPosition;
            var nextTweenPosition = nextTweenGridPosition * this.gridCellWidth;
            var arrowSize = 5;

            // Line
            ctx.strokeStyle = Wick.GUIElement.TWEEN_ARROW_STROKE_COLOR;
            ctx.lineWidth = Wick.GUIElement.TWEEN_ARROW_STROKE_WIDTH;
            ctx.beginPath();
            ctx.moveTo(linePadding, 0);
            ctx.lineTo(nextTweenPosition - linePadding, 0);
            ctx.stroke();

            // Arrow head
            ctx.fillStyle = Wick.GUIElement.TWEEN_ARROW_STROKE_COLOR;
            ctx.beginPath();
            ctx.moveTo(nextTweenPosition - linePadding, 0);
            ctx.lineTo(nextTweenPosition - linePadding - arrowSize, -arrowSize);
            ctx.stroke();

            // Arrow head
            ctx.fillStyle = Wick.GUIElement.TWEEN_ARROW_STROKE_COLOR;
            ctx.beginPath();
            ctx.moveTo(nextTweenPosition - linePadding, 0);
            ctx.lineTo(nextTweenPosition - linePadding - arrowSize, -arrowSize);
            ctx.beginPath();
            ctx.moveTo(nextTweenPosition - linePadding, 0);
            ctx.lineTo(nextTweenPosition - linePadding - arrowSize, arrowSize);
            ctx.stroke();
        } else {
            var tweenPos = this.model.playheadPosition * this.gridCellWidth;
            var frameLength = this.model.parentFrame.length * this.gridCellWidth;
            var frameRightEdge = frameLength - tweenPos + this.gridCellWidth/2;

            // Line
            ctx.save();
            ctx.strokeStyle = Wick.GUIElement.TWEEN_ARROW_STROKE_COLOR;
            ctx.lineWidth = Wick.GUIElement.TWEEN_ARROW_STROKE_WIDTH;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(linePadding, 0);
            ctx.lineTo(frameRightEdge - 2, 0);
            ctx.stroke();
            ctx.restore();
        }

        if(this._ghost) {
            this._ghost.draw();
        }
    }

    get bounds () {
        var r = Wick.GUIElement.TWEEN_DIAMOND_RADIUS * 1.25;
        return {
            x: -r,
            y: -r,
            width: r*2,
            height: r*2,
        }
    }

    onMouseDown (e) {
        var playheadPosition = this.model.playheadPosition - this.model.parentFrame.start + 1;
        this.model.project.activeTimeline.playheadPosition = playheadPosition;

        if(this.model.isSelected) {
            if(e.shiftKey) {
                this.model.project.selection.deselect(this.model);
            }
        } else {
            if(!e.shiftKey) {
                this.model.project.selection.clear();
            }
            this.model.project.selection.select(this.model);
            this.model.parentLayer.activate();
        }
    }

    onMouseDrag (e) {
        if(!this._ghost) {
            this._ghost = new Wick.GUIElement.TweenGhost(this.model);
        }
    }

    onMouseUp (e) {
        if(this._ghost) {
            this._ghost.finish();
            this._ghost = null;
            this.projectWasModified();
        }
    }
}
