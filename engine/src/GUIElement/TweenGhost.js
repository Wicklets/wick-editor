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

Wick.GUIElement.TweenGhost = class extends Wick.GUIElement.Ghost {
    constructor (model) {
        super(model);

        this._mainTween = model;
        this._tweens = model.project.selection.getSelectedObjects('Tween');
    }

    draw () {
        super.draw();

        var ctx = this.ctx;

        // Save how many rows/columns we've moved for later
        this.moveCols = Math.round(this._mouseDiff.x / this.gridCellWidth);
        this.moveRows = Math.round(this._mouseDiff.y / this.gridCellHeight);

        this._tweens.forEach(tween => {
            // Calculate absolute position of this tween ghost
            var relativePlayhead = tween.playheadPosition - this._mainTween.playheadPosition;
            relativePlayhead += tween.parentFrame.start - this._mainTween.parentFrame.start;
            var relativeLayer = tween.parentLayer.index - this._mainTween.parentLayer.index;
            var x = relativePlayhead * this.gridCellWidth;
            var y = relativeLayer * this.gridCellHeight;

            // Translate all tweens relative to the tween originally clicked and dragged
            ctx.save();
            ctx.translate(x, y);
                // New tween position (mouse x,y based)
                ctx.save();
                ctx.globalAlpha = 0.3;
                ctx.translate(this._mouseDiff.x, 0);
                ctx.rotate(Math.PI / 4);
                    var r = Wick.GUIElement.TWEEN_DIAMOND_RADIUS;
                    ctx.fillStyle = Wick.GUIElement.FRAME_GHOST_COLOR;
                    ctx.beginPath();
                    ctx.roundRect(-r, -r, r*2, r*2, 3);
                    ctx.fill();
                ctx.restore();

                // New tween position (grid based)
                ctx.save();
                ctx.strokeStyle = '#00ff00';
                ctx.setLineDash([3, 3]);
                ctx.translate(this.moveCols * this.gridCellWidth, 0);
                ctx.rotate(Math.PI / 4);
                    var r = Wick.GUIElement.TWEEN_DIAMOND_RADIUS;
                    ctx.fillStyle = Wick.GUIElement.FRAME_GHOST_COLOR;
                    ctx.beginPath();
                    ctx.roundRect(-r, -r, r*2, r*2, 3);
                    ctx.stroke();
                ctx.restore();
            ctx.restore();
        });
    }

    finish () {
        var timeline = this._mainTween.project.activeTimeline;
        timeline.playheadPosition += this.moveCols;

        // Move all tweens by how much the mouse moved.
        this._tweens.forEach(tween => {
            tween._originalFrame = tween.parentFrame;
            tween.remove();
        });
        this._tweens.forEach(tween => {
            tween.playheadPosition += this.moveCols;
        });
        this._tweens.forEach(tween => {
            tween._originalFrame.addTween(tween)
            delete tween._originalFrame;
        });
    }
}
