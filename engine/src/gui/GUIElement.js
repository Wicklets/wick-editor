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
     * The paper.js scope that all Wick.View subclasses will use to render to.
     */
    static get paperScope () {
        if(!this._paperScope) {
            this._paperScope = new paper.PaperScope();

            // Create dummy paper.js instance so we can access paper classes
            var canvas = window.document.createElement('canvas');
            this._paperScope.setup(canvas);
        }

        // Use active paper scope for window.paper alias
        window.paper = this._paperScope;

        // Activate the paper scope
        this._paperScope.activate();

        return this._paperScope;
    }

    /**
     *
     */
    constructor (model) {
        this.model = model;
        this.item = null;

        this._eventHandlers = {};

        this._scrollX = 0;
        this._scrollY = 0;
    }

    /**
     * The object to use the data from to create this GUIElement
     */
    set model (model) {
        this._model = model;
    }

    get model () {
        return this._model;
    }

    /**
     * The paper.js item representing this GUIElement
     */
    get item () {
        if(!this._item) {
            this._item = this._buildItem();
        }
        return this._item;
    }

    set item (item) {
        if(this._item) {
            this._item.remove();
        }
        this._item = item;
    }

    /**
     *
     */
    get paper () {
        return Wick.GUIElement.paperScope;
    }

    /**
     *
     */
    get gridCellWidth () {
        return Wick.GUIElement.GRID_DEFAULT_CELL_WIDTH;
    }

    /**
     *
     */
    get gridCellHeight () {
        return Wick.GUIElement.GRID_DEFAULT_CELL_HEIGHT;
    }

    /**
     *
     */
    set scrollX (scrollX) {
        this._scrollX = scrollX;
        this._positionScrollableElements();
    }

    get scrollX () {
        return this._scrollX;
    }

    /**
     *
     */
    set scrollY (scrollY) {
        this._scrollY = scrollY;
        this._positionScrollableElements();
    }

    get scrollY () {
        return this._scrollY;
    }

    /**
     *
     */
    on (eventName, fn) {
        if(!this._eventHandlers[eventName]) {
            this._eventHandlers[eventName] = [];
        }
        this._eventHandlers[eventName].push(fn);
    }

    /**
     *
     */
    fire (eventName, eventInfo) {
        var eventFns = this._eventHandlers[eventName];
        //eventFn && eventFn(eventInfo);
        if(eventFns) {
            eventFns.forEach(fn => {
                fn(eventInfo);
            });
        }
    }

    /**
     *
     */
    build () {
        this.item.removeChildren();
    }

    _buildItem () {
        var item = new this.paper.Group();
        item.remove();
        item.applyMatrix = false;
        item.pivot = new paper.Point(0,0);
        item.data.guiElement = this;
        return item;
    }

    _positionScrollableElements () {

    }
}

Wick.GUIElement.GRID_DEFAULT_CELL_WIDTH = 32;
Wick.GUIElement.GRID_DEFAULT_CELL_HEIGHT = 42;
Wick.GUIElement.TIMELINE_BACKGROUND_COLOR = '#303030';

Wick.GUIElement.SELECTED_ITEM_BORDER_COLOR = '#FFC835';

Wick.GUIElement.BREADCRUMBS_HEIGHT = 34;

Wick.GUIElement.LAYERS_CONTAINER_WIDTH = 195;

Wick.GUIElement.NUMBER_LINE_HEIGHT = 35;
Wick.GUIElement.NUMBER_LINE_NUMBERS_HIGHLIGHT_COLOR = '#ffffff';
Wick.GUIElement.NUMBER_LINE_NUMBERS_COMMON_COLOR = '#494949';
Wick.GUIElement.NUMBER_LINE_NUMBERS_FONT_FAMILY = 'PT Mono';
Wick.GUIElement.NUMBER_LINE_NUMBERS_FONT_SIZE = '18';

Wick.GUIElement.FRAME_HOVERED_OVER = '#D3F8F4';
Wick.GUIElement.FRAME_TWEENED_HOVERED_OVER = '#bbbbee';
Wick.GUIElement.FRAME_CONTENTFUL_FILL_COLOR = '#ffffff';
Wick.GUIElement.FRAME_UNCONTENTFUL_FILL_COLOR = '#ffffff';
Wick.GUIElement.FRAME_TWEENED_FILL_COLOR = '#ccccff';
Wick.GUIElement.FRAME_BORDER_RADIUS = 5;
Wick.GUIElement.FRAME_CONTENT_DOT_RADIUS = 7;
Wick.GUIElement.FRAME_CONTENT_DOT_STROKE_WIDTH = 3;
Wick.GUIElement.FRAME_CONTENT_DOT_COLOR = '#1EE29A';
Wick.GUIElement.FRAME_MARGIN = 0.5;
Wick.GUIElement.FRAME_DROP_SHADOW_DEPTH = 2; // Number of pixels to shift drop shadow below frame.
Wick.GUIElement.FRAME_DROP_SHADOW_FILL = 'rgba(0,0,0,1)';

Wick.GUIElement.FRAME_HANDLE_HOVER_FILL_COLOR = '#29F1A3';

Wick.GUIElement.TWEEN_DIAMOND_RADIUS = 5.5;
Wick.GUIElement.TWEEN_STROKE_WIDTH = 3;
Wick.GUIElement.TWEEN_FILL_COLOR = '#222244';
Wick.GUIElement.TWEEN_HOVER_COLOR = '#ff9933';
Wick.GUIElement.TWEEN_STROKE_COLOR = '#222244';

Wick.GUIElement.FRAME_GHOST_CAN_DROP_COLOR = '#00ff00';
Wick.GUIElement.FRAME_GHOST_CANT_DROP_COLOR = '#ff0000';
Wick.GUIElement.FRAME_GHOST_STROKE_WIDTH = 5;

Wick.GUIElement.FRAMES_STRIP_VERTICAL_MARGIN = 4; 
Wick.GUIElement.FRAMES_STRIP_ACTIVE_FILL_COLOR = '#D8D8D8';
Wick.GUIElement.FRAMES_STRIP_INACTIVE_FILL_COLOR = '#8A8A8A';
Wick.GUIElement.FRAMES_STRIP_BORDER_RADIUS = 4;

Wick.GUIElement.ADD_FRAME_OVERLAY_FILL_COLOR = '#ffffff';
Wick.GUIElement.ADD_FRAME_OVERLAY_PLUS_COLOR = '#aaaaaa';
Wick.GUIElement.ADD_FRAME_OVERLAY_BORDER_RADIUS = 3;
Wick.GUIElement.ADD_FRAME_OVERLAY_MARGIN = 3;

Wick.GUIElement.FRAMES_CONTAINER_VERTICAL_GRID_STROKE_COLOR = 'rgba(0,0,0,0.2)';
Wick.GUIElement.FRAMES_CONTAINER_VERTICAL_GRID_HIGHLIGHT_STROKE_COLOR = 'rgba(255,255,255,0.3)';
Wick.GUIElement.FRAMES_CONTAINER_VERTICAL_GRID_STROKE_WIDTH = 2.5;

Wick.GUIElement.PLAYHEAD_FILL_COLOR = '#FF5C5C';
Wick.GUIElement.PLAYHEAD_STROKE_COLOR = '#AAAAAA';
Wick.GUIElement.PLAYHEAD_STROKE_WIDTH = 3;
Wick.GUIElement.PLAYHEAD_MARGIN = 7;

Wick.GUIElement.LAYER_LABEL_ACTIVE_FILL_COLOR = '#1EE29A';
Wick.GUIElement.LAYER_LABEL_INACTIVE_FILL_COLOR = '#3F5F4C';
Wick.GUIElement.LAYER_LABEL_BORDER_RAIDUS = 2;
Wick.GUIElement.LAYER_LABEL_MARGIN_TOP_BOTTOM = 4;
Wick.GUIElement.LAYER_LABEL_MARGIN_SIDES = 4;
Wick.GUIElement.LAYER_LABEL_FONT_FAMILY = 'Nunito Sans';
Wick.GUIElement.LAYER_LABEL_FONT_SIZE = 18;
Wick.GUIElement.LAYER_LABEL_ACTIVE_FONT_COLOR = '#40002D';
Wick.GUIElement.LAYER_LABEL_INACTIVE_FONT_COLOR = '#322E2E';
Wick.GUIElement.LAYER_LABEL_FONT_WEIGHT = '600';
Wick.GUIElement.LAYER_LABEL_FONT_FAMILY = 'Nunito Sans';

Wick.GUIElement.LAYER_LOCK_BUTTON_ICON = '<g id="Desktop" transform="translate(-1,-1)" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" opacity="1.0"><g id="Artboard-Copy-9"><g id="Group-35"><path d="M1.75910951,5.57091586 L8.31261743,5.57091586 C8.86490218,5.57091586 9.31261743,6.01863111 9.31261743,6.57091586 L9.31261743,12.4597691 C9.31261743,13.0120538 8.86490218,13.4597691 8.31261743,13.4597691 L1.75910951,13.4597691 C1.20682476,13.4597691 0.759109514,13.0120538 0.759109514,12.4597691 L0.759109514,6.57091586 C0.759109514,6.01863111 1.20682476,5.57091586 1.75910951,5.57091586 Z M2.42311363,5.56440544 C2.05430677,2.3340535 2.90894733,0.718877529 4.98703532,0.718877529 C7.04194327,0.718877529 7.87681809,2.3340535 7.49165979,5.56440544 L2.42311363,5.56440544 Z" id="Combined-Shape" stroke="#000000" stroke-width="2"></path><path d="M5.01450068,11 C5.8429278,11 6.51450068,10.3284271 6.51450068,9.5 C6.51450068,8.67157288 5.8429278,8 5.01450068,8 C4.18607355,8 3.51450068,8.67157288 3.51450068,9.5 C3.51450068,10.3284271 4.18607355,11 5.01450068,11 Z" id="Oval-5" fill="#000000"></path></g></g></g>';
Wick.GUIElement.LAYER_HIDE_BUTTON_ICON = '<g id="Group-34"><g id="Group-21" stroke="#000000" stroke-width="2"><path d="M0.326284859,4.42858991 C2.11966435,1.47619664 4.34423606,1.16156172e-16 7,0 C9.6559694,0 11.8791389,1.47642505 13.6695084,4.42927516 L13.6695313,4.42926131 C13.8793286,4.77527928 13.8599227,5.21362782 13.6203692,5.5397528 C11.7107296,8.13951177 9.5039399,9.43939125 7,9.43939125 C4.49627661,9.43939125 2.28812422,8.13973656 0.375542811,5.54042717 L0.375509503,5.54045168 C0.135334247,5.21403953 0.11589474,4.77494961 0.326284859,4.42858991 Z" id="Path-8"></path></g><path d="M7.00541855,7.2075804 C8.38613042,7.2075804 9.50541855,6.08829227 9.50541855,4.7075804 C9.50541855,3.32686852 8.38613042,2.2075804 7.00541855,2.2075804 C5.62470667,2.2075804 4.50541855,3.32686852 4.50541855,4.7075804 C4.50541855,6.08829227 5.62470667,7.2075804 7.00541855,7.2075804 Z" id="Oval-2" fill="#000000"></path></g>';
Wick.GUIElement.LAYER_GNURL_ICON = '<g id="Desktop" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="square"><g id="Artboard-Copy-9" transform="translate(0, 0)" stroke="#00AA6B" stroke-width="2"><g id="Group-3" transform="translate(163.000000, 1116.000000)"><g id="Group-16"><g id="Group-13" transform="translate(158.000000, 10.000000)"><path d="M0.1875,1.5 L8.8125,1.5" id="Line-4"></path><path d="M0.1875,5.5 L8.8125,5.5" id="Line-4-Copy"></path><path d="M0.1875,9.5 L8.8125,9.5" id="Line-4-Copy-2"></path></g></g></g></g></g>';
Wick.GUIElement.LAYER_BUTTON_ICON_COLOR = '#000000';
Wick.GUIElement.LAYER_BUTTON_ICON_OPACITY = 0.3;
Wick.GUIElement.LAYER_BUTTON_HOVER_COLOR = 'orange';
Wick.GUIElement.LAYER_BUTTON_MOUSEDOWN_COLOR = 'yellow';
Wick.GUIElement.LAYER_BUTTON_TOGGLE_ACTIVE_COLOR = 'rgba(255,255,255,0.7)';
Wick.GUIElement.LAYER_BUTTON_TOGGLE_INACTIVE_COLOR = 'rgba(255,255,255,0.01)';

Wick.GUIElement.SCROLLBAR_BACKGROUND_COLOR = '#191919';
Wick.GUIElement.SCROLLBAR_FILL_COLOR = '#ffffff';
Wick.GUIElement.SCROLLBAR_ACTIVE_FILL_COLOR = '#cccccc';
Wick.GUIElement.SCROLLBAR_SIZE = 14;
Wick.GUIElement.SCROLLBAR_MARGIN = 2;
Wick.GUIElement.SCROLLBAR_BORDER_RADIUS = 4;
