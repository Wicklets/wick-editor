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

Wick.GUIElement.Frame = class extends Wick.GUIElement {
    constructor (model) {
        super(model);

        this.canAutoScrollX = true;
        this.canAutoScrollY = true;

        this._ghost = null;
    }

    draw () {
        super.draw();

        var ctx = this.ctx;

        // Fade out frames is layer is hidden
        if(this.model.parentLayer.hidden) ctx.globalAlpha = 0.3;

        // Frame body
        if(this.mouseState === 'over' || this.mouseState === 'down') {
            ctx.fillStyle = Wick.GUIElement.FRAME_HOVERED_OVER;
        } else {
            ctx.fillStyle = Wick.GUIElement.FRAME_UNCONTENTFUL_FILL_COLOR;
        }

        ctx.beginPath();
        ctx.roundRect(0, 0, this.model.length * this.gridCellWidth - 1, this.gridCellHeight - 1, Wick.GUIElement.FRAME_BORDER_RADIUS);
        ctx.fill();

        // Add selection highlight if necessary
        if (this.model.isSelected) {
            ctx.strokeStyle = Wick.GUIElement.SELECTED_ITEM_BORDER_COLOR;
            ctx.lineWidth = Wick.GUIElement.FRAME_HIGHLIGHT_STROKEWIDTH;
            ctx.stroke();
        }

        // Frame scripts dot
        if(this.model.hasContentfulScripts) {
            ctx.fillStyle = Wick.GUIElement.FRAME_SCRIPT_DOT_COLOR;
            ctx.beginPath();
            ctx.arc(this.gridCellWidth/2, 0, Wick.GUIElement.FRAME_CONTENT_DOT_RADIUS*1.3, 0, Math.PI);
            ctx.fill();
        }

        // Frame identifier
        if(this.model.identifier) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, this.model.length * this.gridCellWidth, this.gridCellHeight);
            ctx.clip();
            ctx.font = '12px Courier New';
            ctx.fillStyle = 'black';
            ctx.fillText(this.model.identifier, 0, 12);
            ctx.restore();
        }

        if(this.model.tweens.length === 0 && !this.model.sound) {
            // Frame contentful dot

            ctx.fillStyle = Wick.GUIElement.FRAME_CONTENT_DOT_COLOR;
            ctx.strokeStyle = Wick.GUIElement.FRAME_CONTENT_DOT_COLOR;
            ctx.lineWidth = Wick.GUIElement.FRAME_CONTENT_DOT_STROKE_WIDTH;

            ctx.beginPath();
            ctx.arc(this.gridCellWidth/2, this.gridCellHeight/2, Wick.GUIElement.FRAME_CONTENT_DOT_RADIUS, 0, 2 * Math.PI);
            if(this.model.contentful) {
                ctx.fill();
            }
            ctx.stroke();
        } else if (this.model.sound) {
            // Frame sound waveform

            var sound = this.model.sound;
            var framerate = this.model.project.framerate;

            var waveform = this.model.sound.waveform;
            var maxWidth = this.model.length * this.gridCellWidth;

            var crop = (maxWidth / sound.duration) * this.gridCellWidth / framerate;
            ctx.drawImage(waveform, 0, 0, crop, waveform.height/*/2*/, 0, 0, maxWidth, this.gridCellHeight);
        } else if (this.model.tweens.length > 0) {
            // Tweens

            this.model.tweens.forEach(tween => {
                ctx.save();
                ctx.translate((tween.playheadPosition-1) * this.gridCellWidth + this.gridCellWidth/2, this.gridCellHeight/2);
                    tween.guiElement.draw();
                ctx.restore();
            });
        }

        ctx.globalAlpha = 1.0;

        // Draw drag ghost
        if(this._ghost) {
            this._ghost.draw();
        }
    }

    get bounds () {
        return {
            x: 0,
            y: 0,
            width: this.model.length * this.gridCellWidth,
            height: this.gridCellHeight,
        };
    }

    onMouseDown (e) {
        var playheadPosition = this.model.start + Math.floor(this.localMouse.x / this.gridCellWidth);
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
            this._ghost = new Wick.GUIElement.FrameGhost(this.model);
        }
    }

    onMouseUp (e) {
        this._ghost.finish();
        this._ghost = null;
    }
}
