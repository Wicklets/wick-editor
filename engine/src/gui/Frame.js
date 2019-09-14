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
    }

    get dragGhostClassname () {
        return 'FrameGhost';
    }

    draw () {
        super.draw();

        var ctx = this.ctx;

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

        // Frame identifier
        if(this.model.identifier) {
            /*new paper.PointText({
                point: [0, 12],
                content: this.model.identifier,
                fillColor: 'black',
                fontFamily: 'Courier New',
                fontSize: 12
            })*/
        }

        // Frame scripts dot
        if(this.model.hasContentfulScripts) {
            /*var scriptCircle = new this.paper.Path.Ellipse({
                center: [this.gridCellWidth/2, 0],
                radius: Wick.GUIElement.FRAME_CONTENT_DOT_RADIUS*1.3,
                fillColor: Wick.GUIElement.FRAME_SCRIPT_DOT_COLOR,
            });*/
        }

        // Frame contentful dot
        if(this.model.tweens.length === 0 && !this.model.sound) {
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
            ctx.drawImage(this.model.sound.waveform, 0, 0);
            /*waveform.scaling.x = this.gridCellWidth / 1200 * this.model.project.framerate * this.model.sound.duration;
            waveform.scaling.y = 2;
            waveform.position = new paper.Point((waveform.width/2) * waveform.scaling.x, this.gridCellHeight);
            */
        } else if (this.model.tweens.length > 0) {
            // todo tweens
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
        if(this.model.isSelected) return;
        if(!e.shiftKey) {
            this.model.project.selection.clear();
        }
        this.model.project.selection.select(this.model);
    }
}
