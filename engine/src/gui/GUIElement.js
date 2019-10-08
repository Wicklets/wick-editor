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

Wick.GUIElement = class {
    /**
     * Create a new GUIElement
     * @param {Wick.Base} model - The object containing the data to use to draw this GUIElement
     */
    constructor (model) {
        this.model = model;

        this.canAutoScrollY = false;
        this.canAutoScrollY = false;

        this.cursor = 'default';
    }

    /**
     * The object to use the data from to create this GUIElement
     * @type {Wick.Base}
     */
    set model (model) {
        this._model = model;
    }

    get model () {
        return this._model;
    }

    /**
     * The root GUIElement.
     * @type {Wick.GUIElement}
     */
    get project () {
        if(!this._root) {
            this._root = this.model.project.guiElement;
        }
        return this._root;
    }

    /**
     * The canvas that this GUIElement belongs to.
     */
    get canvas () {
        return this.project._canvas;
    }

    /**
     * The context of the canvas that this GUIElement belongs to.
     */
    get ctx () {
        return this.model.project.guiElement._ctx;
    }

    /**
     * The current translation of the canvas. NOTE: This won't work without the following polyfill:
     * https://github.com/goessner/canvas-currentTransform
     * @type {object}
     */
    get currentTranslation () {
        var transform = this.ctx.currentTransform;
        return {
            x: transform.e,
            y: transform.f,
        };
    }

    /**
     * A copy of the transformation of the canvas when this object was drawn.
     * @type {object}
     */
    get localTranslation () {
        return this._localTranslation;
    }

    /**
     * The current grid cell width that all GUIElements are based off of.
     * @type {number}
     */
    get gridCellWidth () {
        return Wick.GUIElement.GRID_DEFAULT_CELL_WIDTH;
    }

    /**
     * The current grid cell height that all GUIElements are based off of.
     * @type {number}
     */
    get gridCellHeight () {
        return Wick.GUIElement.GRID_DEFAULT_CELL_HEIGHT;
    }

    /**
     * The bounding box of the hit area for mouse interactions.
     * @type {object}
     */
    get bounds () {
        // Implemeneted by subclasses
        return null;
    }

    /**
     * The position of the mouse relative to this elements translation.
     * @type {object}
     */
    get localMouse () {
        var translation = this.localTranslation;
        var localMouse = {
            x: this.project._mouse.x - translation.x,
            y: this.project._mouse.y - translation.y,
        };
        return localMouse;
    }

    /**
     * Checks if this object is touching the mouse.
     * @returns {boolean}
     */
    mouseInBounds (mouse) {
        if(!this.bounds) return false;

        var localMouse = this.localMouse;
        var bounds = this.bounds;
        return localMouse.x > bounds.x &&
               localMouse.y > bounds.y &&
               localMouse.x < bounds.x + bounds.width &&
               localMouse.y < bounds.y + bounds.height;
    }

    /**
     * Check if the mouse is hovering or clicking this element.
     * @type {string}
     */
    get mouseState () {
        if(this === this.project._getTopMouseTarget()) {
            if(this.project._isDragging) {
                return 'down';
            } else {
                return 'over';
            }
        } else {
            return 'out';
        }
    }

    /**
     * Draw this GUIElement
     */
    draw () {
        this._localTranslation = this.currentTranslation;
        this.project.markElementAsDrawn(this);
    }

    /**
     * The function to call when the mouse clicks this element.
     */
    onMouseDown (e) {
        // Implemeneted by subclasses.
    }

    /**
     * The function to call when the mouse drags this element.
     */
    onMouseDrag (e) {
        // Implemeneted by subclasses.
    }

    /**
     * The function to call when the mouse finishes a click on this element.
     */
    onMouseUp (e) {
        // Implemeneted by subclasses.
    }

    /**
     * Causes the project to call it's onProjectModified function. Call this after modifying the project.
     */
    projectWasModified () {
        this.project._onProjectModified();
    }

    /**
     * Causes the project to call it's onProjectSoftModified function. Call this after modifying the project.
     */
    projectWasSoftModified () {
        this.project._onProjectSoftModified();
    }
}

Wick.GUIElement.GRID_SMALL_CELL_WIDTH = 22;
Wick.GUIElement.GRID_SMALL_CELL_HEIGHT = 32;
Wick.GUIElement.GRID_NORMAL_CELL_WIDTH = 38;
Wick.GUIElement.GRID_NORMAL_CELL_HEIGHT = 42;
Wick.GUIElement.GRID_LARGE_CELL_WIDTH = 62;
Wick.GUIElement.GRID_LARGE_CELL_HEIGHT = 52;

/* Automatically choose larger frames if we're on a tablet */
const userAgent = navigator.userAgent.toLowerCase();
const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);
if(isTablet) {
    Wick.GUIElement.GRID_DEFAULT_CELL_WIDTH = Wick.GUIElement.GRID_LARGE_CELL_WIDTH;
    Wick.GUIElement.GRID_DEFAULT_CELL_HEIGHT = Wick.GUIElement.GRID_LARGE_CELL_HEIGHT;
} else {
    Wick.GUIElement.GRID_DEFAULT_CELL_WIDTH = Wick.GUIElement.GRID_NORMAL_CELL_WIDTH;
    Wick.GUIElement.GRID_DEFAULT_CELL_HEIGHT = Wick.GUIElement.GRID_NORMAL_CELL_HEIGHT;
}
Wick.GUIElement.GRID_MARGIN = 1;

Wick.GUIElement.TIMELINE_BACKGROUND_COLOR = '#2A2E30';

Wick.GUIElement.SELECTED_ITEM_BORDER_COLOR = '#00ADEF';

Wick.GUIElement.BREADCRUMBS_HEIGHT = 30;
Wick.GUIElement.BREADCRUMBS_BG_COLOR = '#202122';
Wick.GUIElement.BREADCRUMBS_ACTIVE_BUTTON_FILL_COLOR = '#2A2E30';
Wick.GUIElement.BREADCRUMBS_INACTIVE_BUTTON_FILL_COLOR = '#202122';
Wick.GUIElement.BREADCRUMBS_HOVER_BUTTON_FILL_COLOR = '#6F6F6F';
Wick.GUIElement.BREADCRUMBS_SHADOW_COLOR = '#000000';
Wick.GUIElement.BREADCRUMBS_DROP_SHADOW_DEPTH = 2;
Wick.GUIElement.BREADCRUMBS_ACTIVE_BORDER_COLOR = '#1EE29A';
Wick.GUIElement.BREADCRUMBS_HIGHLIGHT_HEIGHT = 3;
Wick.GUIElement.BREADCRUMBS_PADDING = 5;

Wick.GUIElement.LAYERS_CONTAINER_WIDTH = 160;

Wick.GUIElement.NUMBER_LINE_HEIGHT = 35;
Wick.GUIElement.NUMBER_LINE_NUMBERS_HIGHLIGHT_COLOR = '#ffffff';
Wick.GUIElement.NUMBER_LINE_NUMBERS_COMMON_COLOR = '#494949';
Wick.GUIElement.NUMBER_LINE_NUMBERS_FONT_FAMILY = 'Gafata';
Wick.GUIElement.NUMBER_LINE_NUMBERS_FONT_SIZE = '18';

Wick.GUIElement.FRAME_HEIGHT = Wick.GUIElement.FRAMES_STRIP_HEIGHT;
Wick.GUIElement.FRAME_HOVERED_OVER = '#1EE29A';
Wick.GUIElement.FRAME_TWEENED_HOVERED_OVER = '#ddddff';
Wick.GUIElement.FRAME_CONTENTFUL_FILL_COLOR = '#ffffff';
Wick.GUIElement.FRAME_AUDIO_FILL_COLOR = '#ccffff';
Wick.GUIElement.FRAME_UNCONTENTFUL_FILL_COLOR = 'rgba(233,233,233,0.8)';
Wick.GUIElement.FRAME_TWEENED_FILL_COLOR = '#ffffff';
Wick.GUIElement.FRAME_BORDER_RADIUS = 5;
Wick.GUIElement.FRAME_CONTENT_DOT_RADIUS = 7;
Wick.GUIElement.FRAME_CONTENT_DOT_STROKE_WIDTH = 3;
Wick.GUIElement.FRAME_CONTENT_DOT_COLOR = '#1EE29A';
Wick.GUIElement.FRAME_MARGIN = 0.5;
Wick.GUIElement.FRAME_DROP_SHADOW_DEPTH = 2; // Number of pixels to shift drop shadow below frame.
Wick.GUIElement.FRAME_DROP_SHADOW_FILL = 'rgba(0,0,0,1)';
Wick.GUIElement.FRAME_SCRIPT_DOT_COLOR = '#F5A623';

Wick.GUIElement.FRAME_HANDLE_HOVER_FILL_COLOR = Wick.GUIElement.SELECTED_ITEM_BORDER_COLOR;
Wick.GUIElement.FRAME_HANDLE_WIDTH = 12;

Wick.GUIElement.TWEEN_DIAMOND_RADIUS = 7;
Wick.GUIElement.TWEEN_STROKE_WIDTH = 3;
Wick.GUIElement.TWEEN_FILL_COLOR_1 = '#494949';
Wick.GUIElement.TWEEN_FILL_COLOR_2 = '#8E8E8E';
Wick.GUIElement.TWEEN_HOVER_COLOR_1 = '#09C07D';
Wick.GUIElement.TWEEN_HOVER_COLOR_2 = '#1EE29A';
Wick.GUIElement.TWEEN_STROKE_COLOR = '#222244';

Wick.GUIElement.TWEEN_ARROW_STROKE_WIDTH = 2;
Wick.GUIElement.TWEEN_ARROW_STROKE_COLOR = '#8E8E8E';

Wick.GUIElement.FRAME_GHOST_COLOR = Wick.GUIElement.SELECTED_ITEM_BORDER_COLOR;
Wick.GUIElement.FRAME_GHOST_NOT_ALLOWED_COLOR = '#ff0000';
Wick.GUIElement.FRAME_GHOST_OPACITY = .45;
Wick.GUIElement.FRAME_GHOST_STROKE_WIDTH = 5;
Wick.GUIElement.FRAME_HIGHLIGHT_STROKEWIDTH = 3;

Wick.GUIElement.FRAMES_STRIP_VERTICAL_MARGIN = 4;
Wick.GUIElement.FRAMES_STRIP_ACTIVE_FILL_COLOR = 'rgba(216, 216, 216, 0.31)';
Wick.GUIElement.FRAMES_STRIP_INACTIVE_FILL_COLOR = 'rgba(95, 97, 99, 0.31)';
Wick.GUIElement.FRAMES_STRIP_BORDER_RADIUS = 4;

Wick.GUIElement.ADD_FRAME_OVERLAY_FILL_COLOR = '#9E9E9E';
Wick.GUIElement.ADD_FRAME_OVERLAY_PLUS_COLOR = '#191919';

Wick.GUIElement.FRAMES_CONTAINER_VERTICAL_GRID_STROKE_COLOR = 'rgba(0,0,0,0.2)';
Wick.GUIElement.FRAMES_CONTAINER_VERTICAL_GRID_HIGHLIGHT_STROKE_COLOR = 'rgba(255,255,255,0.3)';
Wick.GUIElement.FRAMES_CONTAINER_VERTICAL_GRID_STROKE_WIDTH = 2.5;

Wick.GUIElement.PLAYHEAD_FILL_COLOR = '#FF5C5C';
Wick.GUIElement.PLAYHEAD_STROKE_COLOR = '#D83333';
Wick.GUIElement.PLAYHEAD_STROKE_WIDTH = 3;
Wick.GUIElement.PLAYHEAD_MARGIN = 8;

Wick.GUIElement.LAYER_LABEL_ACTIVE_FILL_COLOR = '#1EE29A';
Wick.GUIElement.LAYER_LABEL_INACTIVE_FILL_COLOR = '#B7B7B7';
Wick.GUIElement.LAYER_LABEL_HIDDEN_FILL_COLOR = 'rgba(183, 183, 183, .1)';
Wick.GUIElement.LAYER_LABEL_BORDER_RADIUS = 3;
Wick.GUIElement.LAYER_LABEL_MARGIN_TOP_BOTTOM = 4;
Wick.GUIElement.LAYER_LABEL_MARGIN_SIDES = 4;
Wick.GUIElement.LAYER_LABEL_FONT_FAMILY = 'Nunito';
Wick.GUIElement.LAYER_LABEL_FONT_SIZE = 18;
Wick.GUIElement.LAYER_LABEL_ACTIVE_FONT_COLOR = '#40002D';
Wick.GUIElement.LAYER_LABEL_INACTIVE_FONT_COLOR = '#322E2E';
Wick.GUIElement.LAYER_LABEL_FONT_WEIGHT = '600';
Wick.GUIElement.LAYER_LABEL_FONT_FAMILY = 'Nunito';
Wick.GUIElement.LAYER_LABEL_GHOST_COLOR =  Wick.GUIElement.SELECTED_ITEM_BORDER_COLOR;
Wick.GUIElement.LAYER_LABEL_HOVER_COLOR = '#F5A623';

/* These icons must be loaded externally. */
Wick.GUIElement.LAYER_BUTTON_ICON_COLOR = '#000000';
Wick.GUIElement.LAYER_BUTTON_ICON_RADIUS = 10;
Wick.GUIElement.LAYER_BUTTON_ICON_OPACITY = 0.3;
Wick.GUIElement.LAYER_BUTTON_HOVER_COLOR = '#00ADEF';
Wick.GUIElement.LAYER_BUTTON_MOUSEDOWN_COLOR = '#0198D1';
Wick.GUIElement.LAYER_BUTTON_TOGGLE_ACTIVE_COLOR = 'rgba(255,255,255,0.7)';
Wick.GUIElement.LAYER_BUTTON_TOGGLE_INACTIVE_COLOR = 'rgba(255,255,255,0.01)';

Wick.GUIElement.ACTION_BUTTON_HOVER_COLOR = '#979797';
Wick.GUIElement.ACTION_BUTTON_COLOR = '#979797';
Wick.GUIElement.ACTION_BUTTON_RADIUS = 14;

Wick.GUIElement.SCROLLBAR_HORIZONTAL_LENGTH = 100;
Wick.GUIElement.SCROLLBAR_VERTICAL_LENGTH = 50;
Wick.GUIElement.SCROLLBAR_BACKGROUND_COLOR = '#191919';
Wick.GUIElement.SCROLLBAR_FILL_COLOR = '#B7B7B7';
Wick.GUIElement.SCROLLBAR_ACTIVE_FILL_COLOR = '#cccccc';
Wick.GUIElement.SCROLLBAR_SIZE = 18;
Wick.GUIElement.SCROLLBAR_MARGIN = 3;
Wick.GUIElement.SCROLLBAR_BORDER_RADIUS = 6;

Wick.GUIElement.AUTO_SCROLL_SPEED = 0.17;
