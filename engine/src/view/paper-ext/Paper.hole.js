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
    paper-hole.js
    Adds hole() to the paper Layer class which finds the shape of the hole
    at a certain point. Use this to make a vector fill bucket!

    This version uses a flood fill + potrace method of filling holes.

    Adapted from the FillBucket tool from old Wick

    by zrispo (github.com/zrispo) (zach@wickeditor.com)
 */

//const toolbox = require('./Offsets/ToolBox');
//const extensions = require('./Offsets/PaperJsExtensions');

(function () {
    var onError;
    var onFinish;

    var layers;
    var layerGroup;

    var x;
    var y;

    const MAX_NEST = 10;
    const MAX_ITERS = 1000;
    const EPSILON = 0.001;

    var holeColor = null;

    function colorAt(p) {
        var hit = layerGroup.hitTest(p);
        if (hit === null) {
            return null;
        }
        else if (hit.type === "stroke") {
            return hit.item.strokeColor;
        }
        else if (hit.type === "fill") {
            return hit.item.fillColor;
        }
    }

    function colorsEqual(c1, c2) {
        if (c1 === null || c2 === null) {
            return c1 === null && c2 === null;
        }
        return c1.red === c2.red && c1.green === c2.green && c1.blue === c2.blue;
    }

    function tangentsEqual(t1, t2) {
        return (t1.x === 0 && t2.x === 0) ||
                (t1.y === 0 && t2.y === 0) ||
                (t1.x !== 0 && t2.y !== 0 && 
                Math.abs(t1.y / t1.x * t2.x / t2.y - 1) < 0.05);
    }

    // Check whether the locations of p1, p2, are equal within the tolerance of EPSILON
    function pointsEqual(p1, p2, epsilon) {
        return Math.abs(p1.x - p2.x) < epsilon && Math.abs(p1.y - p2.y) < epsilon;
    }

    function curveColor(c) {
        if (!c.path) {
            return null;
        }
        else if (c.path.parent._class === 'CompoundPath') {
            return c.path.parent.fillColor;
        }
        else {
            return c.path.fillColor;
        }
    }
    
    function cleanup(item, epsilon) {
        item.reorient(false, false);
        var paths;
        if (item._class === 'Path') {
            paths = [item];
        }
        else {
            paths = item.children;
        }

        for (let p = 0; p < paths.length; p++) {
            path = paths[p];
            for (let i = 0; i < path.segments.length; ) {
                if (pointsEqual(path.segments[i].point, path.segments[(i + 1) % path.segments.length].point, epsilon)) {
                    let removed = path.removeSegment(i);
                    console.log(path.segments.length, i);
                    if (path.segments.length) {
                        path.segments[i % path.segments.length].handleIn = removed.handleIn;
                    }
                }
                else {
                    i++;
                }
            }
        }
    }

    function fillHole () {
        layerGroup = new paper.Group({insert:false});
        layers.reverse().forEach(layer => {
            layer.children.forEach(function (child) {
                if(child._class !== 'Path' && child._class !== 'CompoundPath') return;

                var clone = child.clone({insert:false});

                /*if (clone.hasStroke()) {
                    //var res1 = clone.Offset(clone.strokeWidth/2, clone.strokeWidth/2);
                    var res = clone.Offset(-clone.strokeWidth/2, -clone.strokeWidth/2);
                    //var res = res1.unite(res2);
                    res.remove();

                    //onFinish(res);

                    clone.strokeWidth = 0;

                    layerGroup.addChild(res);
                }*/
                
                cleanup(clone, EPSILON);
                layerGroup.addChild(clone);
            });
        });
        if(layerGroup.children.length === 0) {
            onError('NO_PATHS');
            return;
        }
        console.log(layerGroup);
        
        var p = new paper.Point(x, y);
        holeColor = colorAt(p);
        console.log("hole color", holeColor);

        for (var i = 0; i < MAX_NEST; i++) {
            console.log("nest");
            var path = getShapeAroundPoint(p);
            
            if (path === null) {
                onError('LEAKY_HOLE');
                return;
            }
            
            if (!path.clockwise) {
                path.remove();
                path.fillColor = 'green';
                if (holeColor === null) {
                    path = removeInteriorShapes(path);
                }
                else {
                    path = constructShape(path);
                }
                console.log("done", path);
                onFinish(path);
                return;
            }

            p = path.getNearestLocation(path.bounds.leftCenter).point.add(new paper.Point(-1, 0));
            console.log("starting at ", i, p.toString())
            path.remove();
        }
    }

    function removeInteriorShapes(path) {
        let originalArea = path.area;
        var items = layerGroup.getItems({
            inside: path.bounds.expand(-1),
            class: paper.Path
        });
        for (var i = 0; i < items.length; i++) {
            path = path.subtract(items[i], {insert: false});
        }

        if (path._class === 'CompoundPath') {
            cleanupAreas(path, originalArea);
        }
        return path;
    }

    // Cut out all of the objects inside path
    function constructShape(path) {
        console.log("constructing shape");
        let originalArea = path.area;
        var items = layerGroup.getItems({
            overlapping: path.bounds,
            match: (item) => {
                if (item._class === 'Path') {
                    return item.parent._class !== 'CompoundPath';
                }
                return item._class === 'CompoundPath';
            }
        });
        var p = new paper.Path({insert: false});
        items.sort((a,b) => a.isAbove(b) ? 1 : -1);
        for (var i = 0; i < items.length; i++) {
            let item = items[i];
            if (item !== path) {
                if (colorsEqual(holeColor, item.fillColor)) {
                    p = p.unite(item,{insert: false});
                }
                else {
                    p = p.subtract(item, {insert: false});
                }
            }
        }
        p = p.intersect(path, {insert: false});
        if (p._class === 'CompoundPath') {
            cleanupAreas(p, originalArea);
        }
        return p;
    }

    function cleanupAreas(path, minArea) {
        for (let i = 0; i < path.children.length; ) {
            if (Math.abs(path.children[i].area) < 1 || (path.children[i].area > 0 && Math.abs(minArea / path.children[i].area) > 1.01)) {
                path.children[i].remove();
                console.log("rembove");
            }
            else {
                i++;
            }
        }
    }

    // Get the fill shape which contains the startingPoint
    function getShapeAroundPoint(startingPoint) {
        console.log("get shape around pointtt");
        var intersector = new paper.Curve(
            startingPoint, 
            startingPoint.add(new paper.Point(-10000, 0)));

        var rect = intersector.bounds;
        var items = layerGroup.getItems({
            overlapping: rect,
            class: paper.Path
        });

        var intersection = {time: 2}

        for (var i = 0; i < items.length; i++) {
            for (var j = 0; j < items[i].curves.length; j++) {
                var intersections = intersector.getIntersections(items[i].curves[j]);
                for (var k = 0; k < intersections.length; k++) {
                    if (intersections[k].time < intersection.time &&
                        !colorsEqual(holeColor, colorAt(intersections[k].point.add(new paper.Point(-1, 0))))) {
                        intersection = intersections[k];
                    }
                }
            }
        }
        
        var points = [];
        
        if (intersection.time > 1) {
            console.log("first intersect bad")
            return null;	
        }
        
        var intersection = intersection.intersection;
        intersector = intersection.curve;
        //direction is -1 for backwards along paths, 1 for forwards along paths
        var direction = intersection.normal.dot(new paper.Point(-1, 0)) > 0 ? -1 : 1; 
        var n = 0;
        var ended = false;
        do {
            //console.log("iter");
            if (n === 1) points = [];
            
            intersection = direction < 0 ? 
                getMaxTimeIntersection(intersector, intersection ? intersection.time : 2)
                : getMinTimeIntersection(intersector, intersection ? intersection.time : -1);
            
            if (intersection === null) {
                console.log("no intersection");
                var temp = intersector;
                //console.log(temp);
                intersector = direction === 1 ? 
                    (intersector.next ? intersector.next : intersector.firstSegment) : 
                    (intersector.previous ? intersector.previous : intersector.lastSegment)
                //intersector.path.curves[positiveMod(intersector.index + direction, intersector.path.curves.length)];
                
                var p = direction < 0 ? intersector.point2 : intersector.point1;
                var hIn = direction < 0 ? temp.handle1 : temp.handle2;
                var hOut = direction < 0 ? intersector.handle2 : intersector.handle1;
                console.log(p.toString());
                points.push(new paper.Segment(p, hIn, hOut));
            }
            else {
                console.log("yes intersection", intersection, direction);
                var ray_direction = intersection.tangent.multiply(direction);
                var wall_normal = intersection.intersection.normal.multiply(-1);
                var inside = ray_direction.dot(wall_normal) > 0;
                var same_fill = colorsEqual(holeColor, curveColor(intersection.intersection.curve));
                var above = (holeColor === null) || intersection.intersection.curve.path.isAbove(intersection.curve.path);
                console.log("rangis", above, inside, same_fill);
                if (!(!above && !same_fill)) {
                    //not forward
                    var turn_multiplier = 1;
                
                    if (above && !inside && !same_fill) {
                        console.log("subtract")
                    }
                    else if (!inside && same_fill) {
                        console.log("union")
                        turn_multiplier = -1;
                    }
                    else if (!above && inside && same_fill && colorsEqual(holeColor, colorAt(intersection.point.add(ray_direction.add(intersection.normal))))) {
                        console.log("turn");
                    }
                    else {
                        console.log("!!!!!!!!!");
                    }

                    var p = intersection.point;
                    var hIn = intersection.tangent;
                    var hOut = intersection.intersection.tangent.multiply(-1);
                    console.log(p.toString());
                    points.push(new paper.Segment(p, hIn, hOut));
                    
                    var incoming = intersection.tangent.multiply(direction);
                    intersection = intersection.intersection;
                    direction = turn_multiplier * (intersection.normal.dot(incoming) > 0 ? -1 : 1);
                    intersector = intersection.curve;
                }
                else {
                    console.log("forward")
                }
            }
            n++;
            ended = points.length >= 2 && pointsEqual(points[points.length - 1].point, points[0].point, EPSILON);
        } while (n < MAX_ITERS && !ended);

        console.log("iters: " + n);
        
        points.pop();
        var path = new paper.Path(points);
        path.closePath();

        return path;
    }


    // Gets the first intersection past the point on the curve at time min_t
    function getMinTimeIntersection(curve, min_t) {
        //console.log("forward");
        var rect = curve.bounds;
        var items = layerGroup.getItems({
            overlapping: rect,
            class: paper.Path
        });

        var min_t_object = {time: 2};

        for (var i = 0; i < items.length; i++) {
            for (var j = 0; j < items[i].curves.length; j++) {
                var intersections = curve.getIntersections(items[i].curves[j]);
                for (var k = 0; k < intersections.length; k++) {
                    if (intersections[k].time > min_t + EPSILON && 
                        intersections[k].time < min_t_object.time &&
                        !tangentsEqual(intersections[k].tangent, intersections[k].intersection.tangent)) {
                        min_t_object = intersections[k];
                    }
                }
            }
        }
        
        if (min_t_object.time > 1) {
            return null;
        }
        
        return min_t_object;
    }
        
    // Gets the first intersection before the point on the curve at time max_t
    function getMaxTimeIntersection(curve, max_t) {
        //console.log("backward");
        var rect = curve.bounds;
        var items = layerGroup.getItems({
            overlapping: rect,
            class: paper.Path
        });
        var max_t_object = {time: -1};
        
        for (var i = 0; i < items.length; i++) {
            for (var j = 0; j < items[i].curves.length; j++) {
                var intersections = curve.getIntersections(items[i].curves[j]);
                for (var k = 0; k < intersections.length; k++) {
                    if (intersections[k].time < max_t - EPSILON && 
                        intersections[k].time > max_t_object.time &&
                        !tangentsEqual(intersections[k].tangent, intersections[k].intersection.tangent)) {
                        max_t_object = intersections[k];
                    }
                }
            }
        }
        
        if (max_t_object.time < 0) {
            return null;
        }
        
        return max_t_object;
    }

    /* Add hole() method to paper */
    paper.PaperScope.inject({
        hole: function(args) {
            if(!args) console.error('paper.hole: args is required');
            if(!args.point) console.error('paper.hole: args.point is required');
            if(!args.onFinish) console.error('paper.hole: args.onFinish is required');
            if(!args.onError) console.error('paper.hole: args.onError is required');
            if(!args.layers) console.error('paper.hole: args.layers is required');

            onError = args.onError;
            onFinish = args.onFinish;

            layers = args.layers;
            x = args.point.x;
            y = args.point.y;

            console.log("-----------------starting---------------------");
            fillHole();
        }
    });
})();
