/*
 * Copyright 2019 WICKLETS LLC
 *
 * This file is part of Paper.js-drawing-tools.
 *
 * Paper.js-drawing-tools is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Paper.js-drawing-tools is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Paper.js-drawing-tools.  If not, see <https://www.gnu.org/licenses/>.
 */

/*
    paper-hole.js
    Adds hole() to the paper Layer class which finds the shape of the hole
    at a certain point. Use this to make a vector fill bucket!

    This version is a "cookie cutter" method using boolean subtraction.

    by zrispo (github.com/zrispo) (zach@wickeditor.com)
 */

(function () {

    __flattenLayerIntoSinglePath (layer) {

    }

    __createNegativeOfPath (path) {

    }

    __findFilledHolePath (path, point) {
        
    }

    /* Add hole() method to paper.Layer class */

    paper.Layer.inject({
        hole: function(args) {
            if(!args) console.error('paper.hole: args is required');
            if(!args.point) console.error('paper.hole: args.point is required');
            if(!args.onFinish) console.error('paper.hole: args.onFinish is required');
            if(!args.onError) console.error('paper.hole: args.onError is required');

            var point = args.point;
            var onFinish = args.onFinish;
            var onError = args.onError;

            var layer = this;

            /*
             * Step one: Flatten entire layer into a single SVG CompoundPath.
             * This requires all strokes to be removed or flattened into paths.
             */

            var flattenedLayerPath = __flattenLayerIntoSinglePath(layer);

            /*
             * Step two: Boolean subtract the layer SVG from a large rectangle
             * SVG to create a "negative" of the layer SVG
             */

            var negativePath = __createNegativeOfPath(flattenedLayerPath);

            /*
             * Step three: Use the mouse position to determine which pieces of
             * the "negative" SVG correspond to the hole we want to fill.
             */

            var filledHolePath = __findFilledHolePath(negativePath, point);
        }
    });

})();
