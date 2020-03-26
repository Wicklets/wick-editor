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
    paper-erase.js
    Adds erase() to the paper Layer class which erases paths in that layer using
    the shape of a given path. Use this to make a vector eraser!

    by zrispo (github.com/zrispo) (zach@wickeditor.com)
 */

(function () {

    // Splits a CompoundPath with multiple CW children into individual pieces
    function splitCompoundPath (compoundPath) {
        // Create lists of 'holes' (CCW children) and 'parts' (CW children)
        var holes = [];
        var parts = [];
        compoundPath.children.forEach(function (child) {
            if(!child.clockwise) {
                holes.push(child);
            } else {
                var part = child.clone({insert:false});
                part.fillColor = compoundPath.fillColor;
                part.insertAbove(compoundPath);
                parts.push(part);
            }
        });

        // Find hole ownership for each 'part'
        var resolvedHoles = [];
        parts.forEach(function (part) {
            var cmp;
            holes.forEach(function (hole) {
                if(part.bounds.contains(hole.bounds)) {
                    if(!cmp) {
                        cmp = new paper.CompoundPath({insert:false});
                        cmp.insertAbove(part);
                        cmp.addChild(part.clone({insert:false}));
                    }
                    cmp.addChild(hole);
                    resolvedHoles.push(hole);
                }
                if(cmp) {
                    cmp.fillColor = compoundPath.fillColor;
                    cmp.insertAbove(part);
                    part.remove();
                }
            });
        });

        // If any holes could not find a path to be a part of, turn them into their own paths
        holes.filter(hole => {
            return resolvedHoles.indexOf(hole) === -1;
        }).forEach(hole => {
            hole.clockwise = !hole.clockwise;
            paper.project.activeLayer.addChild(hole);
        });

        compoundPath.remove();
    }

    function eraseFill (path, eraserPath) {
        if(path.closePath) path.closePath();
        var res = path.subtract(eraserPath, {
            insert: false,
            trace: true,
        });
        res.fillColor = path.fillColor;
        if(res.children) {
            res.insertAbove(path);
            res.data = {};
            path.remove();
            splitCompoundPath(res);
        } else {
            if(res.segments.length > 0) {
                res.data = {};
                res.insertAbove(path);
            }
            path.remove();
        }
        path.remove();
    }

    function eraseStroke (path, eraserPath) {
        var res = path.subtract(eraserPath, {
            insert: false,
            trace: false,
        });
        if(res.children) {
            // Since the path is only strokes, it's trivial to split it into individual paths
            var children = [];
            res.children.forEach(function (child) {
                child.data = {};
                children.push(child);
                child.name = null;
            });
            children.forEach(function (child) {
                child.insertAbove(path);
            });
            res.remove();
        } else {
            res.remove();
            if(res.segments.length > 0)
                res.insertAbove(path);
        }
        path.remove();
    }

    function splitPath (path) {
        var fill = path.clone({insert:false});
        fill.name = null;
        fill.strokeColor = null;
        fill.strokeWidth = 1;

        var stroke = path.clone({insert:false});
        stroke.name = null;
        stroke.fillColor = null;

        fill.insertAbove(path);
        stroke.insertAbove(fill);
        path.remove();

        return {
            fill: fill,
            stroke: stroke,
        };
    }

    function eraseWithPath (eraserPath) {
        var touchingPaths = [];
        this.children.forEach(function (child) {
            if(eraserPath.bounds.intersects(child.bounds)) {
                touchingPaths.push(child);
            }
        });

        touchingPaths.filter(path => {
            return path instanceof paper.Path
                || path instanceof paper.CompoundPath;
        }).forEach(path => {
            if(path.strokeColor && path.fillColor) {
                var res = splitPath(path);
                eraseFill(res.fill, eraserPath);
                eraseStroke(res.stroke, eraserPath);
            } else if(path.fillColor) {
                eraseFill(path, eraserPath);
            } else if(path.strokeColor) {
                eraseStroke(path, eraserPath);
            }
        });
    }

    paper.Layer.inject({
        erase: eraseWithPath
    });

})()
