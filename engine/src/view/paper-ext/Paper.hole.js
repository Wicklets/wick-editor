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

    Description of Algorithm:

    Shoot ray to left from click location, get first intersection at
    which color changes. If no such intersection exists, the user is filling shape
    with a gap.

    Traverse upwards from first intersection. At the end of each curve, or at
    intersections on the current curve (the one we are currently traversing),
    create small circle (radius = RADIUS). 
    
    Get the intersections on this circle, traversing the circle counterclockwise 
    starting from the point right after where we traversed from. 
    Find the first intersection along the circle at which there is a color change 
    (from the hole color to a different color, different either on stroke or fill), 
    then traverse along this new curve with which we are intersecting.

    An invariant of the traversal process is that the hole color is always to the right
    of the point we are traversing along (where forward is the direction in which we are traversing), 
    and a different color is always to the left.

    When the traversal comes back to the beginning, we have defined a loop. 
    If the loop is clockwise, we have filled a hole and are done.
    Otherwise, we shoot a ray from the leftmost part of our loop, and start a new traversal.

    by Nikolas Diamant (nick@wickeditor.com)
*/

(function () {
    var onError;
    var onFinish;

    var layers;
    var layerGroup;

    // point clicked by user
    var x;
    var y;

    // Distance to bump curves by to detect gaps
    var GAP_FILL = 0;
    // Maximum number of traversals
    const MAX_NEST = 16;
    // Maximum number of iterations in a single traversal
    const MAX_ITERS = 2048;
    const EPSILON = 0.001;
    // Radius of circles used in traversal
    const RADIUS = 0.01;
    const STEP_SIZE = 0.001;

    var fillColor;
    var holeColor = null;

    // Returns:
    // 1 if traveling in the direction of vector along the curve at curveLocation
    // is equivalent to traveling forwards along the curve.
    // -1 " backwards ".
    function getDirection(curveLocation, vector) {
        return curveLocation.tangent.dot(vector) > 0 ? 1 : -1;
    }

    // Return color of stroke of a path, null if no stroke.
    function getPathStroke(p) {
        if (p.hasStroke && 
            p.strokeWidth > 0 && 
            p.strokeColor) {
            return p.strokeColor;
        }
        return null;
    }

    // Return pixel color at point p
    function getColorAt(p) {
        var hit = layerGroup.hitTest(p, {fill: true});
        if (hit === null) {
            return null;
        }
        return hit.item.fillColor;
    }

    // Return if two colors RGB are equal, ignores alpha.
    function colorsEqual(c1, c2) {
        if (c1 === null || c2 === null) {
            return c1 === null && c2 === null;
        }
        return c1.red === c2.red && c1.green === c2.green && c1.blue === c2.blue && c1.alpha === c2.alpha;
    }

    // Check whether the locations of p1, p2, are equal within EPSILON
    function pointsEqual(p1, p2) {
        return Math.abs(p1.x - p2.x) < EPSILON && Math.abs(p1.y - p2.y) < EPSILON;
    }

    function bumpedCurve(c, direction) {
        let curve = c.clone();
        let c1 = curve.getCurvatureAtTime(0);
        let c2 = curve.getCurvatureAtTime(1);
        let r1 = c1 === 0 ? 2 : direction / c1;
        let r2 = c2 === 0 ? 2 : direction / c2;
        let scale1 = Math.max(Math.min((r1 - GAP_FILL) / r1, 2), 0);
        let scale2 = Math.max(Math.min((r2 - GAP_FILL) / r2, 2), 0);
        let n1 = curve.getNormalAtTime(0).multiply(-direction).normalize(GAP_FILL);
        let n2 = curve.getNormalAtTime(1).multiply(-direction).normalize(GAP_FILL);
        curve.point1 = curve.point1.add(n1);
        curve.point2 = curve.point2.add(n2);
        curve.handle1 = curve.handle1.multiply(scale1);
        curve.handle2 = curve.handle2.multiply(scale2);
        console.log('bump scale', scale1, scale2);
        return curve;
    }

    // Performs the algoritm described at top of file.
    function fillHole () {
        // Prepare/clean data
        layerGroup = new paper.Group({insert:false});
        layers.reverse().forEach(layer => {
            layer.children.forEach(function (child) {
                if(child._class !== 'Path' && child._class !== 'CompoundPath') return;

                var clone = child.clone({insert:false});

                if (!clone.closed || Math.abs(clone.area) > 0.01) layerGroup.addChild(clone);
            });
        });
        if(layerGroup.children.length === 0) {
            onError('NO_PATHS');
            return;
        }
        
        var p = new paper.Point(x, y);
        holeColor = getColorAt(p);
        if (colorsEqual(holeColor, {red: fillColor.r, green: fillColor.g, blue: fillColor.b, alpha: fillColor.a})) {
            onError('FILL_EQUALS_HOLE');
            return null;
        }

        for (var i = 0; i < MAX_NEST; i++) {
            // getShapeAroundPoint performs the traversal.
            var path = getShapeAroundPoint(p);
            
            if (path === null) {
                return;
            }
            
            // If clockwise, we are done
            if (path.clockwise) {
                path.remove();
                if (holeColor === null) {
                    path = removeInteriorShapes(path);
                }
                else {
                    path = constructShape(path);
                }
                removeDuplicatePoints(path);
                onFinish(path);
                return;
            }

            // Update point from which we shoot ray to the left
            p = path.getNearestLocation(path.bounds.leftCenter).point.add(new paper.Point(-1, 0));
            
            path.remove();
        }
        onError('TOO_COMPLEX');
    }

    // Removes redundant points from path
    function removeDuplicatePoints(path) {
        let paths;
        if (path._class === 'CompoundPath') {
            paths = path.children;
        }
        else {
            paths = [path];
        }

        for (let i = 0; i < paths.length; i++) {
            let p = paths[i];
            for (let j = 0; j < p.segments.length; ) {
                if (pointsEqual(p.segments[j].point, p.segments[(j + 1) % p.segments.length].point)) {
                    let removed = p.removeSegment(j);
                    if (p.segments.length) {
                        p.segments[j % p.segments.length].handleIn = removed.handleIn;
                    }
                }
                else {
                    j++;
                }
            } 
        }
    }

    // Assumes the path is colorless, removes all overlapping shapes
    function removeInteriorShapes(path) {
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
            cleanupAreas(path);
        }
        return path;
    }

    function overlappingBounds(b1, b2) {
        return !(b1.right < b2.left || b2.right < b1.left) && !(b1.bottom < b2.top || b2.bottom < b1.top);
    }

    // Unites all shapes of the same color as hole, subtracts paths of different colors,
    // intersects with path.
    function constructShape(path) {
        var items = layerGroup.getItems({
            match: (item) => {
                if (overlappingBounds(path.bounds, item.bounds)) {
                    if (item._class === 'Path') {
                        return item.parent._class !== 'CompoundPath';
                    }
                    return item._class === 'CompoundPath';
                }
                else {
                    return false;
                }
            }
        });
        var p = new paper.Path({insert: false});
        items.sort((a,b) => a.isAbove(b) ? 1 : -1);
        let pArea = p.area;
        let newP, newPArea;
        for (var i = 0; i < items.length; i++) {
            let item = items[i];
            if (item.closed) {
                if (colorsEqual(holeColor, item.fillColor)) {
                    newP = p.unite(item,{insert: false});
                    newPArea = newP.area;
                    if (newPArea >= pArea) { // shouldn't have to do this, but avoids an error in paper.js
                        p = newP;
                        pArea = newPArea;
                    }
                }
                else {
                    newP = p.subtract(item, {insert: false});
                    newPArea = newP.area;
                    if (newPArea <= pArea) { // shouldn't have to do this, but avoids an error in paper.js
                        p = newP
                        pArea = newPArea;
                    }
                }
            }
        }
        newP = p.intersect(path, {insert: false});
        newPArea = newP.area;
        if (newPArea < pArea) { // shouldn't have to do this, but avoids an error in paper.js
            p = newP;
            pArea = newPArea;
        }
        if (p._class === 'CompoundPath') {
            cleanupAreas(p);
        }
        return p.area > EPSILON ? p : path;
    }

    // Ensures the CompoundPath path is contiguous. This means there is a single
    // clockwise path, and no holes within holes.
    function cleanupAreas(path) {
        let maxArea = 0;
        let info = path.children.map(p => {
            let area = p.area;
            if (area > maxArea) {
                maxArea = area;
            }
            return {item: p, area: area}
        });
        for (let i = 0; i < info.length; ) {
            if (Math.abs(info[i].area) < 1 || (info[i].area > 0 && info[i].area < maxArea)) {
                var bounds = info[i].item.bounds;
                info[i].item.remove();
                info.splice(i, 1);
                for (let j = 0; j < info.length;) {
                    if (bounds.contains(info[j].item.bounds) && info[j].area < 0) {
                        info[j].item.remove();
                        info.splice(j, 1);
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

    //
    function curveIntersections(currentCurve, gapCurve, currentCurveLocation, gapCrossLocation, currentTime, closestTime, currentDirection, f) {
        var pathsToIntersect = layerGroup.getItems({
            class: paper.Path,
            overlapping: gapCurve ? gapCurve.bounds : currentCurve.bounds,
            match: (item) => !currentCurveLocation || item !== currentCurveLocation.intersection.curve.path
        });
        
        for (let i = 0; i < pathsToIntersect.length; i++) {
            for (let c = 0; c < pathsToIntersect[i].curves.length; c++) {
                let intersectionsWithCurve = gapCurve ? gapCurve.getIntersections(pathsToIntersect[i].curves[c]) : currentCurve.getIntersections(pathsToIntersect[i].curves[c]);
                for (let j = 0; j < intersectionsWithCurve.length; j++) {
                    let intersectionCurrentWithNext = intersectionsWithCurve[j];
                    let timeAtThisIntersection = (intersectionCurrentWithNext.time + (gapCurve ? currentCurve.index : intersectionCurrentWithNext.index)) % currentCurve.path.curves.length;

                    //time to traverse forwards from currentTime to timeAtThisIntersection
                    let forwardsDiff = (timeAtThisIntersection - currentTime + currentCurve.path.curves.length) % currentCurve.path.curves.length;
                    //time to traverse backwards from currentTime to timeAtThisIntersection
                    let backwardsDiff = currentCurve.path.curves.length - forwardsDiff;

                    //time to traverse forwards from closestTime to timeAtThisIntersection
                    let forwardsDiff2 = closestTime ? (timeAtThisIntersection - closestTime + currentCurve.path.curves.length) % currentCurve.path.curves.length : 0;
                    //time to traverse backwards from closestTime to timeAtThisIntersection
                    let backwardsDiff2 = currentCurve.path.curves.length - forwardsDiff2;

                    // If the path isn't a closed loop, you can't necessarily traverse from one point
                    // to another in a given direction, so we give it essentially infinite distance.
                    if (!currentCurve.path.closed) {
                        if (timeAtThisIntersection - currentTime < 0) {
                            forwardsDiff = Infinity;
                        }
                        else {
                            backwardsDiff = Infinity;
                        }
                        if (timeAtThisIntersection - closestTime < 0) {
                            forwardsDiff2 = Infinity;
                        }
                        else {
                            backwardsDiff2 = Infinity;
                        }
                    }

                    if (currentCurve.closed ? currentDirection * forwardsDiff < currentDirection * backwardsDiff : currentDirection * forwardsDiff < currentDirection * (currentCurve.path.curves.length - currentTime) &&
                        ((!currentCurveLocation && !gapCrossLocation) || currentDirection * forwardsDiff2 > currentDirection * backwardsDiff2) &&
                        f(intersectionCurrentWithNext)) {
                        if (gapCurve) {
                            gapCrossLocation = intersectionCurrentWithNext;
                        }
                        else {
                            currentCurveLocation = intersectionCurrentWithNext;
                        }
                        closestTime = timeAtThisIntersection;
                    }
                }
            }
        }
        return [closestTime, currentCurveLocation, gapCrossLocation];
    }

    // Shoot ray to the left from startingPoint, perform traversal.
    function getShapeAroundPoint(startingPoint) {
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
                return a.intersection.path.isAbove(b.intersection.path) ? -1 : 1;
            }
            else {
                return diff;
            }
        });
        var currentCurveLocation = null;
        for (let c = 0; c < crossings.length; c++) {
            let crossing = crossings[c];

            let colorAt = getPathStroke(crossing.intersection.path);
            let colorAfter = getColorAt(crossing.point.add(new paper.Point(-EPSILON, 0)));

            if ((colorAt && !colorsEqual(holeColor, colorAt)) || !colorsEqual(holeColor, colorAfter)) {
                currentCurveLocation = crossing.intersection;
                currentCurve = currentCurveLocation.curve;
                var currentDirection = getDirection(currentCurveLocation, new paper.Point(0, -1));
                break;
            }
        }
        
        if (currentCurveLocation === null) {
            onError('LEAKY_HOLE');
            return null;
        }
        
        var points = [];
        
        var n = 0;
        var ended = false;

        let circle = new paper.Path([new paper.Point(RADIUS, 0), new paper.Point(0, -RADIUS), new paper.Point(-RADIUS, 0), new paper.Point(0, RADIUS)]);

        circle.closePath();
        circle.smooth('continuous');
        let pointToAdd;
        while (n < MAX_ITERS && !ended) {
            console.log('------------', n);
            if (n === 1) {
                points = [];
            }
            let currentTime = (currentCurveLocation.time + currentCurve.index) % currentCurve.path.curves.length;

            currentCurveLocation = null;
            
            let [clt, ccl, gcl] = curveIntersections(currentCurve, null, currentCurveLocation, null, currentTime, null, currentDirection, () => true);
            let closestTime = clt;
            currentCurveLocation = ccl;

            let gapCrossLocation = null;
            if (currentCurve.length > EPSILON) {
                let gapCurve = bumpedCurve(currentCurve, currentDirection);
                [clt, ccl, gcl] = curveIntersections(currentCurve, gapCurve, currentCurveLocation, gapCrossLocation, currentTime, closestTime, currentDirection, (a) => 
                    colorsEqual(holeColor, getColorAt(a.point.subtract(a.tangent.multiply(currentDirection).normalize(RADIUS)))) &&
                    !colorsEqual(holeColor, getColorAt(a.point.add(a.tangent.multiply(currentDirection).normalize(RADIUS)))));
                closestTime = clt;
                gapCrossLocation = gcl;
                console.log('gcl1', gcl);
                if (currentCurve.closed) {
                    gapCurve = bumpedCurve(currentCurve, -currentDirection);
                    [clt, ccl, gcl] = curveIntersections(currentCurve, gapCurve, currentCurveLocation, gapCrossLocation, currentTime, closestTime, currentDirection, (a) => 
                        !colorsEqual(holeColor, getColorAt(a.point.subtract(a.tangent.multiply(currentDirection).normalize(RADIUS)))) &&
                        colorsEqual(holeColor, getColorAt(a.point.add(a.tangent.multiply(currentDirection).normalize(RADIUS)))));
                    gapCrossLocation = gcl;
                    console.log('gcl2', gcl);
                }
            }
            console.log('gapCrossLocation', gapCrossLocation);

            if (currentCurveLocation === null) {
                currentCurveLocation = currentCurve.getLocationAtTime(currentDirection < 0 ? 0 : 1);
            }

            
            points.push({p1: pointToAdd, p2: gapCrossLocation ? currentCurve.getNearestLocation(gapCrossLocation.point) : currentCurveLocation});

            circle.position = gapCrossLocation ? gapCrossLocation.point : currentCurveLocation.point;
            console.log('circle', circle.bounds.center.toString());
            //onFinish(circle.clone());

            var crossings = [];
            var items = layerGroup.getItems({
                overlapping: circle.bounds.expand(RADIUS),
                class: paper.Path
            });

            for (let i = 0; i < items.length; i++) {
                crossings = crossings.concat(circle.getCrossings(items[i]));
            }

            crossings.sort((a,b) => {
                let diff = a.index + a.time - b.index - b.time;
                if (Math.abs(diff) <= STEP_SIZE) {
                    return a.intersection.path.isAbove(b.intersection.path) ? -1 : 1;
                }
                else {
                    return diff;
                }
            })
            console.log('crossings');
            crossings.map((crossing, i) => console.log(i, crossing.index, crossing.time));

            let startingIndex = 0;
            if (gapCrossLocation) {
                let incomingTangent = gapCrossLocation.tangent.multiply(-currentDirection);
                let incomingIndex = (2 * Math.PI - Math.atan2(incomingTangent.y, incomingTangent.x)) * 2 / Math.PI + EPSILON;
                let minIndexDiff = 4;
                for (let i = 0; i < crossings.length; i++) {
                    let indexDiff = (crossings[i].time + crossings[i].index - incomingIndex + 4) % 4;
                    if (indexDiff < minIndexDiff) {
                        minIndexDiff = indexDiff;
                        startingIndex = i;
                    }
                }
            }
            else {
                let good = false;
                for (let i = 0; i < crossings.length; i++) {
                    let crossing = crossings[i];
                    if (crossing.intersection.curve.path === currentCurve.path && 
                        ((currentCurve.index - crossing.intersection.curve.index) * currentDirection + currentCurve.path.curves.length) % currentCurve.path.curves.length <= 1 &&
                        currentDirection !== getDirection(crossing.intersection, crossing.point.subtract(currentCurveLocation.point))) {
                        startingIndex = i + 1;
                        for (let j = 1; j < crossings.length; j++) {
                            let crossing2 = crossings[(i + j) % crossings.length];
                            if (Math.abs(Math.abs(crossing2.time + crossing2.index - crossing.time - crossing.index) - 2) < 1.99) {
                                startingIndex = (i + j) % crossings.length;
                                good = true;
                                break;
                            }
                        }
                        break;
                    }
                }
                if (!good) console.log("!good");
            }
            console.log(startingIndex);
            let good = false;
            for (let i = 0; i < crossings.length; i++) {
                console.log((startingIndex + i) % crossings.length);
                let crossing = crossings[(startingIndex + i) % crossings.length];
                
                let colorBefore = getColorAt(crossing.point.subtract(crossing.tangent.normalize(RADIUS * STEP_SIZE)));

                if (colorsEqual(colorBefore, holeColor)) {
                    console.log('colorsEqual');
                    let colorAt = getPathStroke(crossing.intersection.path)
                    let colorAfter = getColorAt(crossing.point.add(crossing.tangent.normalize(RADIUS * STEP_SIZE)));

                    if ((colorAt && !colorsEqual(holeColor, colorAt)) || !colorsEqual(holeColor, colorAfter)) {
                        console.log('colorChange');
                        currentDirection = getDirection(crossing.intersection, crossing.point.subtract(circle.bounds.center));
                        currentCurveLocation = crossing.intersection;
                        pointToAdd = crossing.intersection.curve.getNearestLocation(circle.bounds.center);
                        currentCurve = crossing.intersection.curve;
                        good = true;
                        break;
                    }
                }
            }
            if (!good) {
                onFinish(circle.scale(1 / RADIUS));
                onError('NO_VALID_CROSSINGS');
                return null;
            }

            if (points.length >= 2) {
                let p = points[points.length - 1];
                for (let i = 0; i < points.length - 1; i++) {
                    if (p.p1.curve === points[i].p1.curve && 
                        p.p2.curve === points[i].p2.curve && 
                        Math.abs(p.p1.time - points[i].p1.time) < EPSILON &&
                        Math.abs(p.p2.time - points[i].p2.time) < EPSILON) {
                        points = points.slice(i);
                        if (i > 2) {
                            onError("LOOPING");
                            onFinish(circle.scale(1 / RADIUS));
                            return null;
                        }
                        ended = true;
                        break;
                    } 
                }
            }

            n++;
        }
        circle.remove();

        if (n === MAX_ITERS) {
            onError('TOO_COMPLEX');
            return null;
        }
        
        return pathFromPoints(points);
    }

    // Constructs path with correct tangents
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
                    if (p1.time > 1 - EPSILON) {
                        curves.push(p2.curve.getPart(0, p2.time));
                    }
                    else {
                        curves.push(p1.curve.getPart(p1.time, 1));
                    }
                }
                else {
                    if (p1.time < EPSILON) {
                        curves.push(p2.curve.getPart(1, p2.time));
                    }
                    else {
                        curves.push(p1.curve.getPart(p1.time, 0));
                    }
                }
            }
        }
        let segments = [];
        for (let c = 0; c < curves.length; c++) {
            segments.push(new paper.Segment(curves[c].point1, null, curves[c].handle1));
            segments.push(new paper.Segment(curves[c].point2, curves[c].handle2, null));
        }
        let path = new paper.Path(segments);
        path.closePath();
        return path;
    }

    /* Add hole() method to paper */
    paper.PaperScope.inject({
        hole: function(args) {
            console.log('----------------------------------- starting -----------------------------------')
            if(!args) console.error('paper.hole: args is required');
            if(!args.point) console.error('paper.hole: args.point is required');
            if(!args.onFinish) console.error('paper.hole: args.onFinish is required');
            if(!args.onError) console.error('paper.hole: args.onError is required');
            if(!args.layers) console.error('paper.hole: args.layers is required');

            GAP_FILL = (args.gapFillAmount ? args.gapFillAmount : 0) + 0.01;
            onError = args.onError;
            onFinish = args.onFinish;

            layers = args.layers;
            x = args.point.x;
            y = args.point.y;

            fillColor = args.fillColor;

            fillHole();
        }
    });
})();