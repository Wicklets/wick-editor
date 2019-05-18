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

Wick.GUIElement.Tween = class extends Wick.GUIElement.Draggable {
    /**
     *
     */
    constructor (model) {
        super(model);

        this.dragOffset = new paper.Point(0,0);

        this.on('mouseOver', () => {
            this.build();
        });

        this.on('mouseDown', (e) => {
            if(!e.modifiers.shift && !this.model.isSelected) {
                this.model.project.selection.clear();
            }
            if(!this.model.isSelected) {
                this.model.project.selection.select(this.model);
                this.model.project.guiElement.build();
            }
            this.build();
        });

        this.on('mouseLeave', () => {
            this.build();
        });

        this.on('dragStart', () => {

        });

        this.on('drag', () => {
            this._dragSelectedTweens();
        });

        this.on('dragEnd', () => {
            this._tryToDropTweens();
        });
    }

    /**
     *
     */
    get x () {
        return (this.model.playheadPosition-1) * this.gridCellWidth;
    }

    /**
     *
     */
    get y () {
        return 0;
    }

    /**
     *
     */
    get width () {
        return 10;
    }

    /**
     *
     */
    get height () {
        return 10;
    }

    /**
     *
     */
    build () {
        super.build();

        var r = Wick.GUIElement.TWEEN_DIAMOND_RADIUS;
        var tweenRect = new this.paper.Path.Rectangle({
            from: new this.paper.Point(-r, -r),
            to: new this.paper.Point(r, r),
            radius: 1,
            fillColor: this.isHoveredOver ? Wick.GUIElement.TWEEN_HOVER_COLOR : Wick.GUIElement.TWEEN_FILL_COLOR,
            strokeColor: this.model.isSelected ? Wick.GUIElement.SELECTED_ITEM_BORDER_COLOR : Wick.GUIElement.TWEEN_STROKE_COLOR,
            strokeWidth: Wick.GUIElement.TWEEN_STROKE_WIDTH,
        });
        tweenRect.rotate(45, tweenRect.bounds.center);
        tweenRect.position = tweenRect.position.add(new paper.Point(this.gridCellWidth/2, this.gridCellHeight/2 + 5));
        this.item.addChild(tweenRect);

        this.item.position = new paper.Point(this.x, this.y);
    }

    /**
     *
     */
    get selectedTweens () {
        return this.model.project.selection.getSelectedObjects(Wick.Tween);
    }

    /**
     *
     */
    drop () {
        this.model.playheadPosition = 1;console.error('todo')
    }

    /**
     *
     */
    get draggingTweens () {
        var draggingTweens = [];
        this.model.parentTimeline.frames.forEach(frame => {
            frame.tweens.forEach(tween => {
                if(tween.guiElement.ghost.active) {
                    draggingTweens.push(tween);
                }
            })
        });
        return draggingTweens;
    }

    _dragSelectedTweens () {
        this.selectedTweens.forEach(tween => {
            tween.guiElement.item.bringToFront();
            tween.guiElement.dragOffset = this.mouseDelta;
            tween.guiElement.ghost.active = true;
            tween.guiElement.build();
        });
    }

    _tryToDropTweens () {
        this.draggingFrames.forEach(frame => {
            frame.guiElement.drop();
            frame.guiElement.leftEdgeStretch = 0;
            frame.guiElement.dragOffset = new paper.Point(0,0);
            frame.guiElement.ghost.active = false;
            frame.guiElement.build();
        });

        this.model.project.guiElement.fire('projectModified');
    }
}
