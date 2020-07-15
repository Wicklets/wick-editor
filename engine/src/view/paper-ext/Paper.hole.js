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

    function positiveMod(a, b) {
        return ((a % b) + b) % b;
    }
    
    function cleanup(item, epsilon) {
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
                    path.segments[i % path.segments.length].handleIn = removed.handleIn;
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
        var hit = layerGroup.hitTest(p);
        if (hit.type === "stroke") {
            holeColor = hit.item.fillColor;
        }
        else if (hit.type === "fill") {
            holeColor = hit.item.strokeColor;
        }

        for (var i = 0; i < MAX_NEST; i++) {
            console.log("nest");
            var path = getShapeAroundPoint(p);
            
            if (path === null) {
                onError('LEAKY_HOLE');
                return;
            }
            
            if (path.clockwise) {
                //path = removeInteriorShapes(path);
                path.fillColor = 'green';
                console.log("done");
                onFinish(path);
                return;
            }

            p = path.getNearestPoint(path.bounds.leftCenter).add(new paper.Point(-1, 0));
            path.remove();
        }
    }

    // Cut out all of the objects inside path
    function removeInteriorShapes(path) {
        console.log("removing interior");
        var items = layerGroup.getItems({
            inside: path.bounds.expand(-1),
            class: paper.Path
        });
        console.log(items);
        for (var i = 0; i < items.length; i++) {
            var newPath = path.subtract(items[i]);	
            path.remove();
            path = newPath;
        }
        return path;
    }

    // Get the fill shape which contains the startingPoint
    function getShapeAroundPoint(startingPoint) {
        console.log("get shape around point");
        var intersector = new paper.Curve(
            startingPoint, 
            startingPoint.add(new paper.Point(-10000, 0)));
        
        var origin = getMinTimeIntersection(intersector, -1);
        var points = [];
        
        if (origin === null) {
            console.log("first intersect bad")
            return null;	
        }
        
        var intersection = origin.intersection;
        intersector = intersection.curve;
        //direction is -1 for backwards along paths, 1 for forwards along paths
        var direction = intersection.normal.dot(new paper.Point(-1, 0)) > 0 ? 1 : -1; 
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
                console.log("yes intersection");
                var p = intersection.point;
                var hIn = intersection.tangent.multiply(-1);
                var hOut = intersection.intersection.tangent;
                console.log(p.toString());
                points.push(new paper.Segment(p, hIn, hOut));
                
                var incoming = intersection.tangent.multiply(direction);
                intersection = intersection.intersection;
                direction = intersection.normal.dot(incoming) > 0 ? 1 : -1;
                intersector = intersection.curve;
            }
            n++;
            ended = points.length >= 2 && pointsEqual(points[points.length - 1].point ? points[points.length - 1].point : points[points.length - 1], points[0].point ? points[0].point : points[0], EPSILON);
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
        //if (curve.path) {
        //    items = items.filter(function (item) {return item.isAbove(curve.path)});
        //}
        //console.log("items: " + items.length);

        var min_t_object = {time: 2};

        for (var i = 0; i < items.length; i++) {
            for (var j = 0; j < items[i].curves.length; j++) {
                //if (curve !== items[i].curves[j]) {
                    var intersections = curve.getIntersections(items[i].curves[j]);
                    for (var k = 0; k < intersections.length; k++) {
                        if (intersections[k].time > min_t + EPSILON && intersections[k].time < min_t_object.time) {
                            min_t_object = intersections[k];
                        }
                    }
                //}
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
                //if (curve === items[i].curves[j]) {
                    var intersections = curve.getIntersections(items[i].curves[j]);
                    for (var k = 0; k < intersections.length; k++) {
                        if (intersections[k].time < max_t - EPSILON && intersections[k].time > max_t_object.time) {
                            max_t_object = intersections[k];
                        }
                    }
                //}
            }
        }
        
        if (max_t_object.time < 0) {
            return null;
        }
        
        return max_t_object;
    }

    // Check whether the locations of p1, p2, are equal within the tolerance of EPSILON
    function pointsEqual(p1, p2, epsilon) {
        return Math.abs(p1.x - p2.x) < epsilon && Math.abs(p1.y - p2.y) < epsilon;
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
