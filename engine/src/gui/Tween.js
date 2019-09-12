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
/*
        this.dragOffset = new paper.Point(0,0);
        this.ghost = new Wick.GUIElement.TweenGhost(model);

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
        */
    }

/*
    get x () {
        return (this.model.playheadPosition-1) * this.gridCellWidth;
    }

    get y () {
        return 0;
    }

    get width () {
        return 10;
    }

    get height () {
        return 10;
    }
*/

    draw () {
        super.build();

        this._drawTweenDiamond();
        this._drawTweenArrow();

        /*this.item.position = new paper.Point(this.x, this.y);
        this.item.position.x += this.dragOffset.x;*/
    }

    _drawTweenDiamond () {
      /*
        var leftColor;
        var rightColor;
        if (this.model.isSelected) {
            leftColor = Wick.GUIElement.TWEEN_HOVER_COLOR_1;
            rightColor = Wick.GUIElement.TWEEN_HOVER_COLOR_2;
        } else if (this.isHoveredOver) {
            leftColor = Wick.GUIElement.TWEEN_HOVER_COLOR_1;
            rightColor = Wick.GUIElement.TWEEN_HOVER_COLOR_2;
        } else {
            leftColor =  Wick.GUIElement.TWEEN_FILL_COLOR_1;
            rightColor = Wick.GUIElement.TWEEN_FILL_COLOR_2;
        }

        var r = Wick.GUIElement.TWEEN_DIAMOND_RADIUS;

        // Create right rounded triangle.
        var leftSubtractMask = new this.paper.Path.Rectangle({
            from: new this.paper.Point(-r*2, -r*2),
            to: new this.paper.Point(-.5, r*2), // Shift 1 pixel to the left.
        });

        var tweenRectRight = new this.paper.Path.Rectangle({
            from: new this.paper.Point(-r, -r),
            to: new this.paper.Point(r, r),
            radius: 3,
            fillColor: rightColor,
        });

        // Create left rounded triangle.
        var rightSubtractMask = new this.paper.Path.Rectangle({
            from: new this.paper.Point(.5, -r*2), // Shift 1 pixel to the right.
            to: new this.paper.Point(r*2, r*2),
        });

        var tweenRectLeft = new this.paper.Path.Rectangle({
            from: new this.paper.Point(-r, -r),
            to: new this.paper.Point(r, r),
            radius: 3,
            fillColor: leftColor,
        });

        tweenRectRight.rotate(45, tweenRectRight.bounds.center);
        tweenRectLeft.rotate(45, tweenRectLeft.bounds.center);
        tweenRectRight.remove();
        tweenRectLeft.remove();
        tweenRectRight = tweenRectRight.subtract(leftSubtractMask, {insert: false});
        tweenRectLeft = tweenRectLeft.subtract(rightSubtractMask, {insert: false});
        tweenRectRight.position = tweenRectRight.position.add(new paper.Point(this.gridCellWidth/2, this.gridCellHeight/2));
        tweenRectLeft.position = tweenRectLeft.position.add(new paper.Point(this.gridCellWidth/2, this.gridCellHeight/2));

        this.item.addChild(tweenRectRight);
        this.item.addChild(tweenRectLeft);

        // Create Stroke using a united path to remove the line down the center.
        var combined = tweenRectLeft.unite(tweenRectRight);
        this.item.addChild(combined);
        combined.sendToBack();

        if (this.model.isSelected) {
            combined.strokeColor = Wick.GUIElement.SELECTED_ITEM_BORDER_COLOR;
            combined.strokeWidth = 4;
        } else {
            combined.strokeWidth = 0;
        }
        */
    }

    _drawTweenArrow () {
      /*
        var nextTween = this.model.getNextTween();

        if(!nextTween) return;


        var overlapAmount = 5; // How much should we overlap the arrow between tweens?

        var nextTweenGridPosition = nextTween.playheadPosition - this.model.playheadPosition;
        var nextTweenPosition = nextTweenGridPosition * this.gridCellWidth;
        nextTweenPosition -= this.dragOffset.x;
        var tweenLineVerticalPosition = this.gridCellHeight / 2;
        var arrowLine = new this.paper.Path.Line({
            from: [this.gridCellWidth - overlapAmount, tweenLineVerticalPosition],
            to: [nextTweenPosition + overlapAmount, tweenLineVerticalPosition],
            strokeColor: Wick.GUIElement.TWEEN_ARROW_STROKE_COLOR,
            strokeWidth: Wick.GUIElement.TWEEN_ARROW_STROKE_WIDTH,
            strokeCap: 'round',
        });
        arrowLine.locked = true;

        this.item.addChild(arrowLine);
        */
    }

/*
    get selectedTweens () {
        return this.model.project.selection.getSelectedObjects(Wick.Tween);
    }

    drop () {
        var newPlayheadPosition = Math.floor(this.x / this.gridCellWidth) + Math.round(this.dragOffset.x / this.gridCellWidth);
        this.model.playheadPosition = newPlayheadPosition + 1;
        this.model.project.activeTimeline.playheadPosition = this.model.parentFrame.start + this.model.playheadPosition - 1;
    }

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
            tween.guiElement.dragOffset.x = Math.round(this.mouseDelta.x / this.gridCellWidth) * this.gridCellWidth;
            tween.guiElement.dragOffset.y = 0;
            tween.guiElement.ghost.active = true;
            tween.guiElement.build();
        });
    }

    _tryToDropTweens () {
        this.draggingTweens.forEach(tween => {
            tween.guiElement.drop();
            tween.guiElement.dragOffset = new paper.Point(0,0);
            tween.guiElement.ghost.active = false;
            tween.guiElement.build();
        });

        this.model.project.guiElement.fire('projectModified');
    }
    */
}
