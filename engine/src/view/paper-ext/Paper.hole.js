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
    const RADIUS = 0.5;
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

    function tangentsEqual(t1, t2) {
        return t1.x === 0 && t2.x === 0 || Math.abs(Math.atan(t1.y / t1.x) - Math.atan(t2.y / t2.x)) < 0.01;
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
        console.log(layerGroup);
        
        var p = new paper.Point(x, y);
        holeColor = getColorAt(p);
        console.log("hole color", holeColor);

        for (var i = 0; i < MAX_NEST; i++) {
            console.log("starting at ", i, p.toString())
            var path = getShapeAroundPoint(p);
            
            if (path === null) {
                return;
            }
            
            if (path.clockwise) {
                path.remove();
                //path.fillColor = 'green';
                if (holeColor === null) {
                    path = removeInteriorShapes(path);
                }
                else {
                    path = constructShape(path);
                }
                //path.strokeWidth = 0;
                //bumpOut(path, );
                console.log("done", path);
                onFinish(path);
                return;
            }

            p = path.getNearestLocation(path.bounds.leftCenter).point.add(new paper.Point(-1, 0));
            
            path.remove();
        }
    }

    function bumpOut(p, ammount) {
        var paths;
        if (p._class === 'Path') {
            paths = [p]
        }
        else {
            paths = p.children;
        }
        for (let i = 0; i < paths.length; i++) {
            path = paths[i];
            for (let j = 0; j < path.segments.length; j++) {
                let segment = path.segments[j];
                let theta1 = Math.atan2(segment.handleIn.y, segment.handleIn.x);
                let theta2 = Math.atan2(segment.handleOut.y, segment.handleOut.x);
                let d_theta = (theta2 - theta1 + Math.PI * 2) % (Math.PI * 2);
                let theta = theta1 + d_theta / 2;
                let normal = new paper.Point(Math.cos(theta), Math.sin(theta)).multiply(ammount);
                console.log("bump normal", normal.toString());
                segment.point = segment.point.add(normal);
            }
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
            if (item.closed) {
                if (colorsEqual(holeColor, item.fillColor)) {
                    console.log("unite");
                    p = p.unite(item,{insert: false});
                }
                else {
                    console.log("subtract");
                    p = p.subtract(item, {insert: false});
                }
            }
        }
        console.log("intersect");
        p = p.intersect(path, {insert: false});
        if (p._class === 'CompoundPath') {
            cleanupAreas(p, originalArea);
        }
        return p.area > EPSILON ? p : path;
    }

    function cleanupAreas(path, minArea) {
        console.log("cleanup areas");
        for (let i = 0; i < path.children.length; ) {
            if (Math.abs(path.children[i].area) < 1 || (path.children[i].area > 0 && Math.abs(minArea / path.children[i].area) > 1.01)) {
                var bounds = path.children[i].bounds;
                path.children[i].remove();
                console.log("removed shape")
                for (let j = 0; j < path.children.length;) {
                    if (bounds.contains(path.children[j].bounds) && path.children[j].area < 0) {
                        path.children[j].remove();
                        console.log("removed hole");
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
        console.log("get shape around point");
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
                    console.log("!!! crazy intersection");
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
                console.log("!!! unexpected color change");
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
            onError('LEAKY_HOLE');
            return null;
        }
        
        var points = [];
        
        var n = 0;
        var ended = false;
        while (n < MAX_ITERS && !ended) {
            console.log("--------------------------------------------------")
            if (n === 1) {
                points = [];
            }

            let previousIntersection = currentIntersection;
            
            var pathsToIntersect = layerGroup.getItems({
                class: paper.Path,
                overlapping: currentCurve.bounds
            })

            let currentTime = (currentIntersection.time + currentCurve.index) % currentCurve.path.curves.length;
            let closestTime;

            console.log("current", currentCurve.path.id, currentCurve.index, currentTime, currentCurve.point1.toString(), currentCurve.point2.toString());
            console.log(currentCurve, currentIntersection);

            currentIntersection = null;
    
            for (let i = 0; i < pathsToIntersect.length; i++) {
                for (let c = 0; c < pathsToIntersect[i].curves.length; c++) {
                    let intersectionsWithCurve = currentCurve.getIntersections(pathsToIntersect[i].curves[c]);
                    for (let j = 0; j < intersectionsWithCurve.length; j++) {
                        let intersectionCurrentWithNext = intersectionsWithCurve[j];
                        let timeAtThisIntersection = (intersectionCurrentWithNext.time + intersectionCurrentWithNext.index) % currentCurve.path.curves.length;

                        console.log("intersection", 
                            intersectionCurrentWithNext, 
                            intersectionCurrentWithNext.point.toString(), 
                            intersectionCurrentWithNext.tangent.toString(),
                            intersectionCurrentWithNext.intersection.tangent.toString(),
                            intersectionCurrentWithNext.path.id, 
                            intersectionCurrentWithNext.curve.index,
                            timeAtThisIntersection,
                            intersectionCurrentWithNext.intersection.path.id, 
                            intersectionCurrentWithNext.intersection.curve.index);

                        //!tangentsEqual(intersectionCurrentWithNext.tangent, intersectionCurrentWithNext.intersection.tangent)
                        
                        let forwardsDiff = (timeAtThisIntersection - currentTime + currentCurve.path.curves.length) % currentCurve.path.curves.length;
                        let backwardsDiff = currentCurve.path.curves.length - forwardsDiff;

                        let forwardsDiff2 = closestTime ? (timeAtThisIntersection - closestTime + currentCurve.path.curves.length) % currentCurve.path.curves.length : 0;
                        let backwardsDiff2 = currentCurve.path.curves.length - forwardsDiff2;

                        if (currentDirection * forwardsDiff < currentDirection * backwardsDiff &&
                            (!currentIntersection || currentDirection * forwardsDiff2 > currentDirection * backwardsDiff2)) {
                            currentIntersection = intersectionCurrentWithNext;
                            closestTime = timeAtThisIntersection;
                        }
                    }
                }
            }
            console.log("chosen intersection", currentIntersection);
            currentIntersection && console.log(currentIntersection.path.id, currentIntersection.curve.index, currentIntersection.intersection.path.id, currentIntersection.intersection.curve.index);
            
            
            /*if (currentIntersection === null) {
                console.log("no intersection");
                var previousCurve = currentCurve;
                var turnAround = 1;
                if (currentDirection === 1) {
                    if (currentCurve.next) {
                        currentCurve = currentCurve.next;
                    }
                    else if (currentCurve.path.closed) {
                        console.log("!!! closed but no next")
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
                        console.log("!!! closed but no previous")
                        currentCurve = currentCurve.lastSegment;
                    }
                    else {
                        currentDirection = 1;
                        turnAround = -1;
                    }
                }
                console.log("id " + currentCurve.path.id);
                
                console.log(currentDirection < 0 ? currentCurve.point2.toString() : currentCurve.point1.toString());
                onFinish(new paper.Path.Circle(currentDirection < 0 ? currentCurve.point2 : currentCurve.point1, 2));
                points.push({curve1: previousCurve, time1: turnAround * currentDirection < 0 ? 0 : 1, curve2: currentCurve, time2: currentDirection < 0 ? 1 : 0});
            }*/

            if (currentIntersection === null) {
                console.log("no intersection");

                currentIntersection = currentCurve.getLocationAtTime(currentDirection < 0 ? 0 : 1);
            }

            points.push({p1: previousIntersection, p2: currentIntersection});
            console.log("added curve location", points[points.length - 1]);
            
            //TODO make sure the first point of circle is on the currentCurve
            let circleStartVector = new paper.Point(RADIUS, 0);
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

            crossings.filter((crossing) => {
                let a = currentCurve.path === crossing.intersection.path || !tangentsEqual(currentIntersection.tangent, crossing.intersection.tangent);
                if (!a) console.log("ignored because parallel", crossing);
                return a;
            });

            crossings.filter((crossing) => {
                let a = Math.abs(crossing.tangent.normalize().dot(crossing.intersection.tangent.normalize())) < 0.5;
                if (!a) console.log("ignored because possibly not real intersection", crossing);
                return a;
            });

            crossings.sort((a,b) => {
                let diff = a.index + a.time - b.index - b.time;
                if (diff === 0) {
                    if (a.intersection.path === b.intersection.path) {
                        console.log("!!! crazy circle intersection");
                    }
                    return a.intersection.path.isAbove(b.intersection.path) ? -1 : 1;
                }
                else {
                    return diff;
                }
            })

            console.log("crossings", crossings);
            crossings.map((crossing) => console.log(crossing.point.toString(), crossing.index + crossing.time, crossing.intersection.path.id));

            let startingIndex = 0;
            for (let i = 0; i < crossings.length; i++) {
                let crossing = crossings[i];
                if (crossing.intersection.curve.path === currentCurve.path &&
                    currentDirection !== getDirection(crossing.intersection, crossing.point.subtract(currentIntersection.point))) {
                    startingIndex = i + 1;
                    for (let j = 1; j < crossings.length; j++) {
                        let crossing2 = crossings[(i + j) % crossings.length];
                        if (Math.abs(crossing2.time + crossing2.index - crossing.time - crossing.index) > EPSILON) {
                            startingIndex = (i + j) % crossings.length;
                            break;
                        }
                    }
                    break;
                }
            }
            console.log("starting index", startingIndex);

            for (let i = 0; i < crossings.length; i++) {
                let crossing = crossings[(startingIndex + i) % crossings.length];
                
                let colorBefore = getColorAt(crossing.point.subtract(crossing.tangent.normalize(RADIUS * STEP_RATIO)));

                if (colorsEqual(colorBefore, holeColor)) {
                    let colorAt = getPathStroke(crossing.intersection.path)
                    let colorAfter = getColorAt(crossing.point.add(crossing.tangent.normalize(RADIUS * STEP_RATIO)));

                    console.log(i, colorBefore && colorBefore.components, colorAt && colorAt.components, colorAfter && colorAfter.components);

                    if ((colorAt && !colorsEqual(holeColor, colorAt)) || !colorsEqual(holeColor, colorAfter)) {
                        currentDirection = getDirection(crossing.intersection, crossing.point.subtract(currentIntersection.point));
                        console.log("turn direction", crossing.point.subtract(currentIntersection.point).toString(), currentDirection);
                        currentIntersection = crossing.intersection;
                        currentCurve = crossing.intersection.curve;
                        break;
                    }
                }
                else {
                    console.log("!!! not colorBefore");
                }
            }

            circle.remove();
            
            ended = points.length >= 2 && 
                points[0].p1.curve === points[points.length - 1].p1.curve && 
                points[0].p2.curve === points[points.length - 1].p2.curve && 
                Math.abs(points[0].p1.time - points[points.length - 1].p1.time) < EPSILON && 
                Math.abs(points[0].p2.time - points[points.length - 1].p2.time) < EPSILON;
            n++;
            
            if (!ended) {
                let p = points[points.length - 1];
                for (let i = 0; i < points.length - 1; i++) {
                    if (p.p1.curve === points[i].p1.curve && 
                        p.p2.curve === points[i].p2.curve && 
                        Math.abs(p.p1.time - points[i].p1.time) < EPSILON &&
                        Math.abs(p.p2.time - points[i].p2.time) < EPSILON) {
                        onError('LOOPING');
                        return null;
                    } 
                }
            }
        }

        console.log("iters: " + n);
        if (n === MAX_ITERS) {
            onError('TOO_COMPLEX');
            return null;
        }
        
        return pathFromPoints(points);
    }

    function pathFromPoints(points) {
        points.shift();
        let curves = [];
        for (let i = 0; i < points.length; i++) {
            let p1 = points[i].p1;
            let p2 = points[i].p2;
            if (p1.curve === p2.curve) {
                curves.push(p1.curve.getPart(p1.time, p2.time));
            }
            else {
                if ((p1.curve.index + 1) % p1.curve.path.curves.length === p2.curve.index) {
                    curves.push(p1.curve.getPart(p1.time, 1));
                }
                else {
                    curves.push(p1.curve.getPart(p1.time, 0));
                }
            }
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

            console.log("-----------------starting---------------------");
            fillHole();
        }
    });
})();
