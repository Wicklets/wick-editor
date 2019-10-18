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
        var widthPx = this.model.length * this.gridCellWidth - 1;
        var heightPx = this.gridCellHeight - 1;

        var edge = this._mouseOverFrameEdge();

        if(this.model.contentful || this.model.tweens.length > 0 || this.model.sound) {
            ctx.fillStyle = Wick.GUIElement.FRAME_CONTENTFUL_FILL_COLOR;
        } else {
            ctx.fillStyle = Wick.GUIElement.FRAME_UNCONTENTFUL_FILL_COLOR;
        }
        ctx.beginPath();
        ctx.roundRect(0, 0, widthPx, heightPx, Wick.GUIElement.FRAME_BORDER_RADIUS);
        ctx.fill();
        if(!edge && this.mouseState === 'over' || this.mouseState === 'down') {
            ctx.lineWidth = 3;
            ctx.strokeStyle = Wick.GUIElement.FRAME_HOVERED_OVER;
            ctx.stroke();
        }

        // Add selection highlight if necessary
        if (this.model.isSelected) {
            ctx.strokeStyle = Wick.GUIElement.SELECTED_ITEM_BORDER_COLOR;
            ctx.lineWidth = Wick.GUIElement.FRAME_HIGHLIGHT_STROKEWIDTH;
            ctx.stroke();
        }

        // Frame body edge
        if(edge) {
            this.cursor = 'ew-resize';

            var edgeGradient = ctx.createLinearGradient(widthPx - Wick.GUIElement.FRAME_HANDLE_WIDTH, 0, widthPx, 0);
            edgeGradient.addColorStop(0, 'rgba(255,222,35, 0.0)');
            edgeGradient.addColorStop(1, 'rgba(255,222,35, 1.0)');
            ctx.fillStyle = edgeGradient;
            ctx.strokeStyle = edgeGradient;
            ctx.lineWidth = 5;

            ctx.save();
            if(edge === 'left') {
                ctx.translate(widthPx, 0);
                ctx.scale(-1, 1);
            }

            ctx.beginPath();
            ctx.roundRect(0, 0, widthPx, heightPx, Wick.GUIElement.FRAME_BORDER_RADIUS);
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        } else {
            this.cursor = 'grab';
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
            if(this.model.contentful) {
                ctx.strokeStyle = Wick.GUIElement.FRAME_CONTENT_DOT_COLOR;
            } else {
                ctx.strokeStyle = '#aaa';
            }
            ctx.lineWidth = Wick.GUIElement.FRAME_CONTENT_DOT_STROKE_WIDTH;

            var r = Wick.GUIElement.FRAME_CONTENT_DOT_RADIUS;
            if(this.project.frameSizeMode === 'small') {
                r *= 0.75;
            } else if(this.project.frameSizeMode === 'large') {
                r *= 1.25;
            }

            ctx.beginPath();
            ctx.arc(this.gridCellWidth/2, this.gridCellHeight/2, r, 0, 2 * Math.PI);
            if(this.model.contentful) {
                ctx.fill();
            }
            ctx.stroke();
        } else if (this.model.sound) {
            // Sound waveform

            var framerate = this.model.project.framerate;
            var sound = this.model.sound;
            var waveform = sound.waveform;

            var soundLengthMS = sound.duration * 1000;
            var frameLengthMS = (1 / framerate) * this.model.length * 1000;

            var frameLengthPx = this.model.length * this.gridCellWidth;
            var cropPx = (frameLengthMS / soundLengthMS) * 1200; // base waveform image size: 1200px

            ctx.drawImage(waveform, 0, 0, cropPx, waveform.height, 0, 0, frameLengthPx, this.gridCellHeight);
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

    onMouseDown (e) {
        this._clickedEdge = this._mouseOverFrameEdge();

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

        this.projectWasModified();
    }

    onMouseDrag (e) {
        if(!this._ghost) {
            var edge = this._clickedEdge;
            if(edge) {
                this._ghost = new Wick.GUIElement.FrameEdgeGhost(this.model, edge);
            } else {
                this._ghost = new Wick.GUIElement.FrameGhost(this.model);
            }
        }
    }

    onMouseUp (e) {
        if(this._ghost) {
            this._ghost.finish();
            this._ghost = null;
            this.projectWasModified();
        }
    }

    get bounds () {
        // Notice the slight addition of 1px on the left and right sides
        // This prevents issues where you can create frames in between other frames.
        return {
            x: -1,
            y: 0,
            width: this.model.length * this.gridCellWidth + 1,
            height: this.gridCellHeight + 1,
        };
    }

    /* helper function for frame edge dragging */
    _mouseOverFrameEdge () {
        var widthPx = this.model.length * this.gridCellWidth;
        var handlePx = Wick.GUIElement.FRAME_HANDLE_WIDTH;

        if(this.project.frameSizeMode === 'small') handlePx *= 0.5;

        if(this.project._isDragging || !this.mouseInBounds()) {
            return null;
        } else if(this.localMouse.x < handlePx) {
            return 'left'
        } else if (this.localMouse.x > widthPx - handlePx) {
            return 'right';
        } else {
            // Mouse is over the frame, but on either edge
            return null;
        }
    }
}
