/*
 * Copyright 2020 WICKLETS LLC
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
    paper-potrace.js
    Adds a potrace() method to paper Items that runs potrace on a rasterized
    version of that Item.

    by zrispo (github.com/zrispo) (zach@wickeditor.com)
 */

paper.Path.inject({
    potrace: function(args) {
        var self = this;
        if(!args) throw new Error('Path.potrace: args is required.');
        if(!args.resolution) throw new Error('Path.potrace: args.resolution is required.');
        if(!args.done) throw new Error('Path.potrace: args.done is required.');

        var finalRasterResolution = paper.view.resolution*args.resolution/window.devicePixelRatio;
        var raster = this.rasterize(finalRasterResolution);
        raster.remove();
        var rasterDataURL = raster.toDataURL();

        if(rasterDataURL === 'data:,') {
            args.done(null);
        }

        // https://oov.github.io/potrace/
        var img = new Image();
        img.onload = function() {
            var svg = potrace.fromImage(img).toSVG(1/args.resolution);
            var potracePath = paper.project.importSVG(svg);
            potracePath.position.x = self.position.x;
            potracePath.position.y = self.position.y;
            potracePath.remove();
            potracePath.closed = true;
            potracePath.children[0].closed = true;
            args.done(potracePath.children[0]);
        }
        img.src = rasterDataURL;
    }
});
