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

Wick.GUIElement.Layer = class extends Wick.GUIElement {
    constructor (model) {
        super(model);

        this.hideButton = new Wick.GUIElement.LayerButton(model, Wick.GUIElement.LAYER_LABEL_SHOW_BUTTON_ICON, () => {console.log('asdas')});
        this.lockButton = new Wick.GUIElement.LayerButton(model, Wick.GUIElement.LAYER_LABEL_UNLOCK_BUTTON_ICON, () => {});
    }

    draw () {
        super.draw();

        var ctx = this.ctx;

        if (this.model.hidden) {
            ctx.fillStyle = Wick.GUIElement.LAYER_LABEL_HIDDEN_FILL_COLOR;
        } else if (this.model.isActive) {
            ctx.fillStyle = Wick.GUIElement.LAYER_LABEL_ACTIVE_FILL_COLOR;
        } else {
            ctx.fillStyle = Wick.GUIElement.LAYER_LABEL_INACTIVE_FILL_COLOR;
        }
        if(this.model.isSelected) {
            ctx.strokeStyle = Wick.GUIElement.SELECTED_ITEM_BORDER_COLOR;
            ctx.lineWidth = 3;
        } else {
            ctx.strokeStyle = 'rgba(0,0,0,0)';
            ctx.lineWidth = 0;
        }

        var width = Wick.GUIElement.LAYERS_CONTAINER_WIDTH - Wick.GUIElement.LAYER_LABEL_MARGIN_SIDES*2;
        var height = this.gridCellHeight - Wick.GUIElement.LAYER_LABEL_MARGIN_TOP_BOTTOM*2;

        // Body
        ctx.save();
        ctx.translate(Wick.GUIElement.LAYER_LABEL_MARGIN_SIDES, Wick.GUIElement.LAYER_LABEL_MARGIN_TOP_BOTTOM);
            ctx.beginPath();
            ctx.roundRect(0, 0, width, height, Wick.GUIElement.LAYER_LABEL_BORDER_RADIUS);
            ctx.fill();
            ctx.stroke();
        ctx.restore();

        // Layer name
        ctx.font = "16px " + Wick.GUIElement.LAYER_LABEL_FONT_FAMILY;
        ctx.fillStyle = this.model.isActive
          ? Wick.GUIElement.LAYER_LABEL_ACTIVE_FONT_COLOR
          : Wick.GUIElement.LAYER_LABEL_INACTIVE_FONT_COLOR;
        ctx.fillText(this.model.name, 53, this.gridCellHeight / 2 + 6);

        // Buttons
        ctx.save();
        ctx.translate(20, 20);
            this.hideButton.draw();
        ctx.restore();

        ctx.save();
        ctx.translate(40, 20);
            this.lockButton.draw();
        ctx.restore();
    }

    get bounds () {
        return {
            x: 0,
            y: 0,
            width: Wick.GUIElement.LAYERS_CONTAINER_WIDTH,
            height: this.gridCellHeight,
        }
    }

    onMouseDown (e) {
        this.model.project.selection.clear();
        this.model.project.selection.select(this.model);
    }

/*
        this.lockButton = new Wick.GUIElement.LayerLockButton(model);
        this.hideButton = new Wick.GUIElement.LayerHideButton(model);
        this.tweenButton = new Wick.GUIElement.LayerTweenButton(model);

        this.ghost = new Wick.GUIElement.LayerGhost(model);

        this.on('mouseOver', () => {
            this.build();
        });

        this.on('mouseDown', () => {
            this.model.project.selection.clear();
            this.model.project.selection.select(this.model);
            this.model.activate();
            this.model.project.guiElement.build();
            this.model.project.guiElement.fire('projectModified');
        });

        this.on('mouseLeave', () => {
            this.build();
        });

        this.on('dragStart', () => {
            this._drag();
        });

        this.on('drag', () => {
            this._drag();
        });

        this.on('dragEnd', () => {
            this.drop();
            this.model.project.guiElement.build();
            this.model.project.guiElement.fire('projectModified');
        });
        */

    /*
    get x () {
        return Wick.GUIElement.LAYER_LABEL_MARGIN_SIDES;
    }

    get y () {
        return this.model.index * this.gridCellHeight + Wick.GUIElement.LAYER_LABEL_MARGIN_TOP_BOTTOM;
    }

    get width () {
        return this._width - Wick.GUIElement.LAYER_LABEL_MARGIN_SIDES*2;
    }

    set width (width) {
        this._width = width;
    }

    get height () {
        return this.gridCellHeight - Wick.GUIElement.LAYER_LABEL_MARGIN_TOP_BOTTOM*2;
    }

    get ghostPosition () {
        return new paper.Point(0, this.ghostIndex * this.gridCellHeight - this.model.index * this.gridCellHeight);
    }

    drop () {
        var moveIndex = this.ghostIndex;
        if(moveIndex > this.model.index) moveIndex --;
        this.model.move(moveIndex);
        this.model.activate();
    }

    build () {
        super.build();

        var layerRect = this._layerRect || new this.paper.Path.Rectangle({
            from: new this.paper.Point(0, 0),
            to: new this.paper.Point(this.width, this.height),
            radius: Wick.GUIElement.LAYER_LABEL_BORDER_RADIUS,
        });
        var fillColor;
        if (this.model.hidden) {
            fillColor = Wick.GUIElement.LAYER_LABEL_HIDDEN_FILL_COLOR;
        } else if (this.model.isActive) {
            fillColor = Wick.GUIElement.LAYER_LABEL_ACTIVE_FILL_COLOR;
        } else {
            fillColor = Wick.GUIElement.LAYER_LABEL_INACTIVE_FILL_COLOR;
        }
        layerRect.fillColor = fillColor;
        layerRect.strokeColor = this.model.isSelected ? Wick.GUIElement.SELECTED_ITEM_BORDER_COLOR : 'rgba(0,0,0,0)';
        layerRect.strokeWidth = this.model.isSelected ? 3 : 0;
        this._layerRect = layerRect;
        this.item.addChild(layerRect);

        // Buttons
        this.hideButton.x = 17;
        this.hideButton.y = this.height/2;
        this.hideButton.build();
        this.item.addChild(this.hideButton.item);

        this.lockButton.x = 37;
        this.lockButton.y = this.height/2;
        this.lockButton.build();
        this.item.addChild(this.lockButton.item);

        this.tweenButton.x = this.width - 17;
        this.tweenButton.y = this.height/2;
        this.tweenButton.build();
        this.item.addChild(this.tweenButton.item);

        // Layer name
        var layerNameMask = this._layerNameMask || new paper.Path.Rectangle({
            from: new paper.Point(0, -this.height),
            to: new paper.Point(this.width - 25, this.height),
            fillColor: 'black'
        });
        this._layerNameMask = layerNameMask;

        var layerNameText = this._layerNameText || new paper.PointText({
            point: [53, this.height/2 + 6], // TODO: Create global variable for layer name position.fontFamily: Wick.GUIElement.LAYER_LABEL_FONT_FAMILY,
            fontWeight: 'bold',
            fontSize: 16,
            opacity: 0.6,
            pivot: new paper.Point(0, 0),
        });
        this._layerNameText = layerNameText;
        this._layerNameText.content = this.model.name;
        this._layerNameText.fillColor = this.model.isActive ? Wick.GUIElement.LAYER_LABEL_ACTIVE_FONT_COLOR : Wick.GUIElement.LAYER_LABEL_INACTIVE_FONT_COLOR;

        var clippedLayerName = this._clippedLayerName || new paper.Group({
            children: [layerNameMask, layerNameText]
        });
        this._clippedLayerName = clippedLayerName;
        clippedLayerName.clipped = true;
        clippedLayerName.remove();
        this.item.addChild(clippedLayerName);

        // Drop ghost
        this.ghost.active = this.isDragging && (this.mouseDelta.y !== 0);
        if(this.ghost.active) {
            this.ghost.width = this.width;
            this.ghost.x = 0;
            this.ghost.y = -this.mouseDelta.y + this.ghostPosition.y;
            this.ghost.build();
            this.item.addChild(this.ghost.item);
        }

        this.item.position = new paper.Point(this.x, this.y);
    }

    _drag () {
        var moveIndices = Math.round((this.mouseDelta.y)/this.gridCellHeight);
        this.ghostIndex = this.model.index + moveIndices;
        this.build();
        this.item.position.y += this.mouseDelta.y;
        this.item.bringToFront();
    }
    */
}
