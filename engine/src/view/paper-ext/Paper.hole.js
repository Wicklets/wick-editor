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
    Adds hole() to paper, which finds the shape of the hole
    at a certain point. Use this to make a vector fill bucket!

    by Nikolas Diamant (nick@wickeditor.com)
*/

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
    const RADIUS = 0.1;
    const STEP_RATIO = 0.001;

    var holeColor = null;

    function getDirection(location, vector) {
        return location.tangent.dot(vector) > 0 ? 1 : -1;
    }

    function getPathStroke(p) {
        if (p.hasStroke && 
            p.strokeWidth > 0 && 
            p.strokeColor) {
            return p.strokeColor;
        }
        return null;
    }

    function getColorAt(p) {
        var hit = layerGroup.hitTest(p, {fill: true});
        if (hit === null) {
            return null;
        }
        return hit.item.fillColor;
    }

    function colorsEqual(c1, c2) {
        if (c1 === null || c2 === null) {
            return c1 === null && c2 === null;
        }
        return c1.red === c2.red && c1.green === c2.green && c1.blue === c2.blue;
    }

    // Check whether the locations of p1, p2, are equal within the tolerance of EPSILON
    function pointsEqual(p1, p2) {
        return Math.abs(p1.x - p2.x) < EPSILON && Math.abs(p1.y - p2.y) < EPSILON;
    }
    
    function cleanup(item) {
        item.reorient(false, true);
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
                if (pointsEqual(path.segments[i].point, path.segments[(i + 1) % path.segments.length].point)) {
                    let removed = path.removeSegment(i);
                    //console.log(path.segments.length, i);
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

                cleanup(clone);

                if (!clone.closed || Math.abs(clone.area) > 0.01) layerGroup.addChild(clone);
            });
        });
        if(layerGroup.children.length === 0) {
            onError('NO_PATHS');
            return;
        }
        //console.log(layerGroup);
        
        var p = new paper.Point(x, y);
        holeColor = getColorAt(p);
        //console.log("hole color", holeColor);

        for (var i = 0; i < MAX_NEST; i++) {
            //console.log("nest");
            var path = getShapeAroundPoint(p);
            
            if (path === null) {
                onError('LEAKY_HOLE');
                return;
            }
            
            if (path.clockwise) {
                path.remove();
                path.fillColor = 'green';
                if (holeColor === null) {
                    path = removeInteriorShapes(path);
                }
                else {
                    path = constructShape(path);
                }
                //console.log("done", path);
                path.strokeWidth = 0;
                onFinish(path);
                return;
            }

            p = path.getNearestLocation(path.bounds.leftCenter).point.add(new paper.Point(-1, 0));
            //console.log("starting at ", i, p.toString())
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
            if (items[i].closed) {
                path = path.subtract(items[i], {insert: false});
            }
        }

        if (path._class === 'CompoundPath') {
            cleanupAreas(path, originalArea);
        }
        return path;
    }

    // Cut out all of the objects inside path
    function constructShape(path) {
        //console.log("constructing shape");
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
            if (item.closed) {
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
                var bounds = path.children[i].bounds;
                path.children[i].remove();
                //console.log("removed shape")
                for (let j = 0; j < path.children.length;) {
                    if (bounds.contains(path.children[j].bounds) && path.children[j].area < 0) {
                        path.children[j].remove();
                        //console.log("removed hole");
                    }
                    else {
                        j++;
                    }
                }
            }
            else {
                i++;
            }
        }
    }

    // Get the fill shape which contains the startingPoint
    function getShapeAroundPoint(startingPoint) {
        //console.log("get shape around pointtt");
        var currentCurve = new paper.Curve(
            startingPoint, 
            startingPoint.add(new paper.Point(-10000, 0)));

        var items = layerGroup.getItems({
            class: paper.Path,
            overlapping: currentCurve.bounds
        })
        var crossings = [];
        for (let i = 0; i < items.length; i++) {
            for (let c = 0; c < items[i].curves.length; c++) {
                crossings = crossings.concat(currentCurve.getIntersections(items[i].curves[c]));
            }
        }
        crossings.sort((a,b) => {
            let diff = a.time - b.time;
            if (diff === 0) {
                if (a.intersection.path === b.intersection.path) {
                    //console.log("!!! crazy intersection");
                }
                return a.intersection.path.isAbove(b.intersection.path) ? -1 : 1;
            }
            else {
                return diff;
            }
        });
        var currentIntersection = null;
        for (let c = 0; c < crossings.length; c++) {
            let crossing = crossings[c];
            
            let colorBefore = getColorAt(crossing.point.add(new paper.Point(EPSILON, 0)));
            if (!colorsEqual(holeColor, colorBefore)) {
                //console.log("!!! unexpected color change");
            }

            let colorAt = getPathStroke(crossing.intersection.path);
            let colorAfter = getColorAt(crossing.point.add(new paper.Point(-EPSILON, 0)));

            if ((colorAt && !colorsEqual(holeColor, colorAt)) || !colorsEqual(holeColor, colorAfter)) {
                currentIntersection = crossing.intersection;
                currentCurve = currentIntersection.curve;
                var currentDirection = getDirection(currentIntersection, new paper.Point(0, -1));
                break;
            }
        }
        
        if (currentIntersection === null) {
            return null;
        }
        
        var points = [];
        
        var n = 0;
        var ended = false;
        var startingDirection;
        while (n < MAX_ITERS && !ended) {
            //console.log("--------------------------------------------------")
            if (n === 1) {
                startingDirection = currentDirection;
            }
            
            var pathsToIntersect = layerGroup.getItems({
                class: paper.Path,
                overlapping: currentCurve.bounds
            })

            let currentTime = currentIntersection ? currentIntersection.time : (currentDirection === -1 ? 1 : 0);
            currentIntersection = null;
    
            for (let i = 0; i < pathsToIntersect.length; i++) {
                for (let c = 0; c < pathsToIntersect[i].curves.length; c++) {
                    let intersectionsWithCurve = currentCurve.getIntersections(pathsToIntersect[i].curves[c]);
                    for (let j = 0; j < intersectionsWithCurve.length; j++) {
                        if (currentDirection * intersectionsWithCurve[j].time > currentDirection * currentTime + EPSILON &&
                            (!currentIntersection || currentDirection * intersectionsWithCurve[j].time < currentDirection * currentIntersection.time)) {
                            currentIntersection = intersectionsWithCurve[j];
                        }
                    }
                }
            }
            
            if (currentIntersection === null) {
                //console.log("no intersection");
                var previousCurve = currentCurve;
                var turnAround = 1;
                if (currentDirection === 1) {
                    if (currentCurve.next) {
                        currentCurve = currentCurve.next;
                    }
                    else if (currentCurve.path.closed) {
                        //console.log("!!! closed but no next")
                        currentCurve = currentCurve.firstSegment;
                    }
                    else {
                        currentDirection = -1;
                        turnAround = -1;
                    }
                }
                else {
                    if (currentCurve.previous) {
                        currentCurve = currentCurve.previous;
                    }
                    else if (currentCurve.path.closed) {
                        //console.log("!!! closed but no previous")
                        currentCurve = currentCurve.lastSegment;
                    }
                    else {
                        currentDirection = 1;
                        turnAround = -1;
                    }
                }
                //console.log("id " + currentCurve.path.id);
                                
                /*var p = currentDirection < 0 ? currentCurve.point2 : currentCurve.point1;
                var hIn = currentDirection < 0 ? previousCurve.handle1 : previousCurve.handle2;
                var hOut = currentDirection < 0 ? currentCurve.handle2 : currentCurve.handle1;
                console.log(p.toString());
                points.push(new paper.Segment(p, hIn, hOut));*/
                points.push({curve1: previousCurve, time1: turnAround * currentDirection < 0 ? 0 : 1, curve2: currentCurve, time2: currentDirection < 0 ? 1 : 0});
            }
            else {
                //console.log("yes intersection");
                
                //TODO make sure the first point of circle is on the currentCurve
                let circleStartVector = currentIntersection.tangent.multiply(-currentDirection).rotate(-1).normalize(RADIUS);
                var circle = new paper.Path([circleStartVector, circleStartVector.rotate(-90), circleStartVector.rotate(-180), circleStartVector.rotate(-270)]);
                circle.translate(currentIntersection.point);
                circle.closePath();
                circle.smooth('continuous');

                var crossings = [];
                var items = layerGroup.getItems({
                    overlapping: circle.bounds.expand(1),
                    class: paper.Path
                });
                for (let i = 0; i < items.length; i++) {
                    crossings = crossings.concat(circle.getCrossings(items[i]));
                }

                crossings.sort((a,b) => {
                    let diff = a.index + a.time - b.index - b.time;
                    if (diff === 0) {
                        if (a.intersection.path === b.intersection.path) {
                            //console.log("!!! crazy circle intersection");
                        }
                        return a.intersection.path.isAbove(b.intersection.path) ? -1 : 1;
                    }
                    else {
                        return diff;
                    }
                })

                let previousCurve = null;
                let previousIntersection = null;

                //console.log("crossings", crossings);
                //crossings.map((crossing) => console.log(crossing.point.toString(), crossing.index + crossing.time));

                for (var i = 0; i < crossings.length; i++) {
                    let crossing = crossings[i];
                    if (crossing.intersection.curve === currentIntersection.curve && 
                        currentDirection !== getDirection(crossing.intersection, crossing.point.subtract(currentIntersection.point))) {
                        //console.log("dangus");
                    }
                    else {
                        let colorAt = getPathStroke(crossing.intersection.path)
                        let colorAfter = getColorAt(crossing.point.add(crossing.tangent.normalize(RADIUS * STEP_RATIO)));

                        //debugging
                        let colorBefore = getColorAt(crossing.point.subtract(crossing.tangent.normalize(RADIUS * STEP_RATIO)));
                        /*if (i === 0) {
                            if ((colorAt === null || colorsEqual(colorAt, holeColor)) && colorsEqual(holeColor, colorBefore)) {
                                console.log("!!! BAD NEWS, not diff color to the left");
                            }
                            if (!colorsEqual(colorAfter, holeColor)) {
                                console.log("!!! BAD NEWS, diff color to the right");
                            }
                        }*/

                        if ((colorAt && !colorsEqual(holeColor, colorAt)) || !colorsEqual(holeColor, colorAfter)) {
                            //console.log("colors", colorBefore ? colorBefore.components : null, colorAt ? colorAt.components : null, colorAfter ? colorAfter.components : null);
                            previousIntersection = currentIntersection;
                            previousCurve = currentCurve;

                            currentIntersection = crossing.intersection;
                            currentCurve = crossing.intersection.curve;
                            //console.log("id " + currentCurve.path.id);
                            currentDirection = getDirection(crossing.intersection, crossing.point.subtract(previousIntersection.point));
                            //console.log(crossing.point.subtract(previousIntersection.point).toString(), currentDirection);
                            break;
                        }
                    }
                }

                if (previousIntersection === null) {
                    //console.log("!!! BAD NEWS, circle didn't have any legit intersections");
                }

                /*var p = currentIntersection.point;
                var hIn = previousIntersection.tangent.multiply(previousDirection);
                var hOut = currentIntersection.tangent.multiply(currentDirection);
                console.log(p.toString());
                points.push(new paper.Segment(p, hIn, hOut));*/
                points.push({curve1: previousCurve, time1: previousIntersection.time, curve2: currentCurve, time2: currentIntersection.time});

                circle.remove();
            }
            n++;
            ended = points.length >= 2 && 
                points[0].curve2 === points[points.length - 1].curve2 && 
                Math.abs(points[0].time2 - points[points.length - 1].time2) < EPSILON && 
                currentDirection === startingDirection;
        }

        //console.log("iters: " + n);
        if (n === MAX_ITERS) {
            //console.log("oy");
            return null;
        }
        
        return pathFromPoints(points);
    }

    function pathFromPoints(points) {
        let curves = [];
        for (let i = 0; i < points.length; i++) {
            let p1 = points[i];
            let p2 = points[(i + 1) % points.length];
            curves.push(p1.curve2.getPart(p1.time2, p2.time1));
        }
        let segments = [];
        for (let c = 0; c < curves.length; c++) {
            let c1 = curves[c];
            let c2 = curves[(c + 1) % curves.length];
            let p = c1.point2;
            let hIn = c1.handle2;
            let hOut = c2.handle1;
            segments.push(new paper.Segment(p, hIn, hOut));
        }
        let path = new paper.Path(segments);
        path.closePath();
        return path;
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

            //console.log("-----------------starting---------------------");
            fillHole();
        }
    });
})();
