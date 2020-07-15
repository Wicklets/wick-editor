"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const offsets_constants = require('./Consts');
function IsClose(a, b, Precision) {
    var diff = Math.abs(a - b);
    return diff < Precision;
}
exports.IsClose = IsClose;
// Make in bounds, so we can roll over on lists
function MIB(i, max) {
    while (i >= max) {
        i -= max;
    }
    while (i < 0) {
        i += max;
    }
    return i;
}
exports.MIB = MIB;
// returns the value between 1 and 2 at the percentage
function Lerp(value1, value2, percentage) {
    return value1 + ((value2 - value1) * percentage);
}
exports.Lerp = Lerp;
// returns a line as a curve object
function GetCurveLine(p1, p2, asvector = false) {
    if (asvector == true) {
        p2 = p2.add(p1);
    }
    return new paper.Curve(p1, (p1.Lerp(p2, offsets_constants.ONE_THIRD)).subtract(p1), (p1.Lerp(p2, offsets_constants.TWO_THIRD)).subtract(p2), p2);
}
exports.GetCurveLine = GetCurveLine;
// makes a path from segments, combines close segments into one
function MakePathFromSegments(segments, tolerance = offsets_constants.MY_EPSILON) {
    for (var i = 0; i < segments.length - 1; i++) {
        if (segments[i].point.isClose(segments[i + 1].point, tolerance)) {
            segments[i].handleOut = segments[i + 1].handleOut;
            segments.splice(i + 1, 1);
        }
    }
    return new paper.Path(segments);
}
exports.MakePathFromSegments = MakePathFromSegments;
// makes a path from curves, assumes one curves end is the next curves start
function MakePathFromCurves(curves) {
    if (!util.isArray(curves)) {
        curves = [curves];
    }
    if (curves.length == 0) {
        return null;
    }
    var segs = [];
    segs.push(curves[0].segment1);
    for (var i = 0; i < curves.length - 1; i++) {
        segs.push(new paper.Segment(curves[i].point2.Lerp(curves[i + 1].point1, 0.5), curves[i].segment2.handleIn, curves[i + 1].segment1.handleOut));
    }
    segs.push(curves[curves.length - 1].segment2);
    return new paper.Path(segs);
}
exports.MakePathFromCurves = MakePathFromCurves;
// simple save paths function
function SavePaths(paths, filename = "test", multicolor = false, firstblack = false) {
    filename = filename + ".svg";
    if (!util.isArray(paths)) {
        paths = [paths];
    }
    var output = '';
    var BR = new paper.Point(0, 0);
    var TL = new paper.Point(Number.MAX_VALUE, Number.MAX_VALUE);
    var color = new paper.Color(1, 0, 0);
    var shift = 360 / (paths.length * 1.15);
    for (var i = 0; i < paths.length; i++) {
        BR = paper.Point.max(BR, paths[i].bounds.bottomRight); //
        TL = paper.Point.min(TL, paths[i].bounds.topLeft);
        if (paths[i].strokeColor == null) {
            paths[i].strokeColor = "0xffffff";
            paths[i].strokeWidth = 0.1;
        }
        if (multicolor == true) {
            paths[i].strokeColor = color.clone();
            color.hue += shift;
            if (firstblack == true && i == 0) {
                paths[i].strokeColor = '#000000';
            }
        }
        output += paths[i].exportSVG({ asString: true }) + "\r\n";
    }
    var coordstring = " " + TL.x + " " + TL.y + " " + BR.x + " " + BR.y + " ";
    output = '<svg version="1.1" baseProfile="full" viewBox="' + coordstring + '" viewPort="' + coordstring + '" xmlns="http://www.w3.org/2000/svg"> \r\n' + output + "</svg>";
    fs.writeFileSync(filename, output);
}
exports.SavePaths = SavePaths;
// simple function, gets the length of all curves, then designates the offset for a curve based on length from start
function GetOffsetsForCurves(curves, offset1, offset2) {
    var totallength = 0;
    for (var i = 0; i < curves.length; i++) {
        totallength += curves[i].length;
    }
    var offsetchange = (offset2 - offset1) / totallength;
    var offsets = [];
    var currentlength = 0;
    for (var i = 0; i < curves.length; i++) {
        var s = offset1 + (currentlength * offsetchange);
        currentlength += curves[i].length;
        var e = offset1 + (currentlength * offsetchange);
        offsets.push([s, e]);
    }
    return offsets;
}
exports.GetOffsetsForCurves = GetOffsetsForCurves;
// given two points and a radius it gets the center of the two possible circles, uses the sign of the radius to choose which one to return
function GetCircleCenter(point1, point2, radius) {
    var absoffset = Math.abs(radius);
    var midpoint = point1.Lerp(point2, 0.5);
    var middistance = point1.getDistance(midpoint);
    var centerdistance = Math.sqrt(Math.abs((absoffset * absoffset) - (middistance * middistance)));
    var linetocenter = (midpoint.subtract(point1)).normalize(centerdistance);
    if (radius < 0) {
        linetocenter = linetocenter.rotate(90);
    }
    else {
        linetocenter = linetocenter.rotate(-90);
    }
    var rval = midpoint.add(linetocenter);
    if (rval.isNaN()) {
        debugger;
        return null;
    }
    return rval;
}
exports.GetCircleCenter = GetCircleCenter;
// gets the point where a circle with radius would touch both curves, nearest to the point between curve 1 end to curve 2 start 
function GetTrimTimesForCurvePair(curve1, curve2, radius) {
    var radiusabs = Math.abs(radius);
    if (curve1.AnyChanceBBoxWillIntersect(curve2, radiusabs)) {
        var tdata = curve1.GetShortestDistanceBetween(curve2);
        if (tdata.Distance <= (radiusabs * 2)) {
            var p1 = tdata.MyPos;
            var p2 = tdata.OtherPos;
            var newpos = new paper.Point(0, 0);
            var oldpos = new paper.Point(Number.MAX_VALUE, Number.MAX_VALUE);
            if (p1.equals(p2)) {
                var midpoint = curve1.point2.Lerp(curve2.point1, 0.5);
                var norm = curve1.getNormalAtTime(1).add(curve2.getNormalAtTime(0));
                if (norm.isZero()) {
                    norm = curve1.getTangentAtTime(1).add(curve2.getTangentAtTime(0).multiply(-1));
                }
                newpos = midpoint.add(norm.normalize(radius));
                p1 = curve1.getNearestPoint(newpos);
                p2 = curve2.getNearestPoint(newpos);
            }
            var count = 50;
            while (!newpos.isClose(oldpos, offsets_constants.MY_EPSILON) && newpos != null && count > 0) {
                count--;
                oldpos = newpos;
                newpos = GetCircleCenter(p1, p2, radius);
                if (newpos == null) {
                    debugger;
                }
                p1 = curve1.getNearestPoint(newpos);
                p2 = curve2.getNearestPoint(newpos);
            }
            if (newpos == null) {
                return null;
            }
            var t1 = curve1.getTimeOf(p1);
            var t2 = curve2.getTimeOf(p2);
            return { Time1: t1, Time2: t2, Pos1: p1, Pos2: p2, CenterPos: newpos }; //[p1, p2, newpos];
        }
    }
    return null;
}
exports.GetTrimTimesForCurvePair = GetTrimTimesForCurvePair;
// gets the trim times for a list of curves
function GetTrimTimesForCurves(curves, startoffset, endoffset, openpath) {
    //  console.log("starting");
    var offsets = GetOffsetsForCurves(curves, startoffset, endoffset);
    var trimtimes = [];
    var curvepairs = [];
    for (var i = 0; i < curves.length; i++) {
        trimtimes.push([0, 1]);
        if (i < curves.length - openpath) {
            curvepairs.push([i, MIB(i + 1, curves.length)]);
        }
    }
    // debugger;
    for (var i = 0; i < curvepairs.length; i++) {
        var index0 = curvepairs[i][0];
        var index1 = curvepairs[i][1];
        var c1 = curves[index0];
        var c2 = curves[index1];
        var offset1 = offsets[index0][1]; //0
        var offset2 = offsets[index1][0]; //1
        var newindex0 = index0;
        var newindex1 = index1;
        //   console.log("comparing " + index0 + ":" + index1);
        var data1 = GetTrimTimesForCurvePair(c1, c2, offset1);
        var data2 = data1;
        if (offset1 != offset2) {
            data2 = GetTrimTimesForCurvePair(c1, c2, offset2);
        }
        if (data1 != null) {
            if (data1.Time1 < trimtimes[index0][1]) {
                trimtimes[index0][1] = data1.Time1;
            }
            if (trimtimes[index0][1] <= trimtimes[index0][0]) {
                newindex0 = MIB(index0 - 1, curves.length);
                if (newindex0 == index1) {
                    newindex0 = index0;
                }
                else if (openpath == 1 && newindex0 > index0) {
                    newindex0 = index0;
                }
            }
        }
        if (data2 != null) {
            if (data2.Time2 > trimtimes[index1][0]) {
                trimtimes[index1][0] = data2.Time2;
            }
            if (trimtimes[index1][1] <= trimtimes[index1][0]) {
                newindex1 = MIB(index1 + 1, curves.length);
                if (newindex1 == index0) {
                    newindex1 = index1;
                }
                else if (openpath == 1 && newindex1 < index1) {
                    newindex1 = index1;
                }
            }
        }
        if (newindex0 != index0 && newindex1 != index1) {
            PushIntoListIfDoesntExist([newindex0, newindex1]);
        }
        else if (newindex0 != index0) {
            PushIntoListIfDoesntExist([newindex0, index1]);
        }
        else if (newindex1 != index1) {
            PushIntoListIfDoesntExist([index0, newindex1]);
        }
    }
    function PushIntoListIfDoesntExist(pair) {
        //   var min = Math.min(pair[0], pair[1]);
        //   var max = Math.max(pair[0], pair[1]);
        //   pair = [min, max];
        //  console.log("adding " + pair);
        for (var i = 0; i < curvepairs.length; i++) {
            if (pair[0] == curvepairs[i][0] && pair[1] == curvepairs[i][1]) {
                return;
            }
        }
        curvepairs.push(pair);
        return;
    }
    return trimtimes;
}
exports.GetTrimTimesForCurves = GetTrimTimesForCurves;
// trim curves based on offsets
function TrimCurves(curves, startoffset, endoffset, openpath) {
    if (!util.isArray(curves)) {
        curves = [curves];
    }
    var returncurves = [];
    var trimtimes = GetTrimTimesForCurves(curves, startoffset, endoffset, openpath);
    for (var i = 0; i < trimtimes.length; i++) {
        if (trimtimes[i][0] < trimtimes[i][1]) {
            returncurves.push(curves[i].GetPart(trimtimes[i][0], [trimtimes[i][1]]));
        }
    }
    return returncurves;
}
exports.TrimCurves = TrimCurves;
// gets data related to where two curves join, most importantly wether they would seperate or not based on offset
function GetCurveCurvePointData(curve1, curve2, offset, id) {
    var normal1 = curve1.getNormalAtTime(1).normalize(offset);
    var normal2 = curve2.getNormalAtTime(0).normalize(offset);
    var angle = normal1.getDirectedAngle(normal2);
    var ArcNeedid = Math.sign(angle) == Math.sign(offset);
    if (Math.abs(angle) == 180) {
        ArcNeedid = Math.sign(offset) == 1;
    }
    return { NeedArc: ArcNeedid, Offset: offset, Middle: curve1.point2, Id: id };
}
exports.GetCurveCurvePointData = GetCurveCurvePointData;
// given data where curve,curve will seperate creates arcs that form a path.
// most importantly uses left/right hand rule to figure out what arcs should be in the path 
// and which ones should not be
function GetArcPath(arcpointdatalist, startpos, endpos) {
    var paths = [];
    // find start and end arcs and remove any arc before/after
    var beststartdistance = Number.MAX_SAFE_INTEGER;
    var bestenddistance = Number.MAX_SAFE_INTEGER;
    var beststartid = -1;
    var bestendid = -1;
    for (var i = 0; i < arcpointdatalist.length; i++) {
        var startdis = Math.abs(arcpointdatalist[i].Middle.getDistance(startpos) - Math.abs(arcpointdatalist[i].Offset));
        var enddis = Math.abs(arcpointdatalist[i].Middle.getDistance(endpos) - Math.abs(arcpointdatalist[i].Offset));
        if (startdis < beststartdistance) {
            beststartdistance = startdis;
            beststartid = i;
        }
        if (enddis < bestenddistance) {
            bestenddistance = enddis;
            bestendid = i;
        }
    }
    arcpointdatalist = arcpointdatalist.slice(beststartid, bestendid + 1);
    // if its simple just do the arcs
    if (arcpointdatalist.length == 1) {
        paths.push(GetArc(arcpointdatalist[0].Middle, arcpointdatalist[0].Offset, startpos, endpos));
        //  return paths;
    }
    else if (arcpointdatalist.length == 2) {
        var p = FindCircleCircleintersection(arcpointdatalist[0].Middle, arcpointdatalist[0].Offset, arcpointdatalist[1].Middle, arcpointdatalist[1].Offset);
        paths.push(GetArc(arcpointdatalist[0].Middle, arcpointdatalist[0].Offset, startpos, p));
        paths.push(GetArc(arcpointdatalist[1].Middle, arcpointdatalist[1].Offset, p, endpos));
        //   return paths;
    }
    else {
        //  console.log("three or more");
        function RemoveArcsFromIdToBest(point, id) {
            var bestvec = null;
            var bestid = -1;
            var bestpoint = null;
            for (var i = id + 1; i < arcpointdatalist.length; i++) {
                var distancebetweenmiddles = arcpointdatalist[id].Middle.getDistance(arcpointdatalist[i].Middle);
                var radiidistance = Math.abs(arcpointdatalist[id].Offset) + Math.abs(arcpointdatalist[i].Offset);
                if (distancebetweenmiddles <= radiidistance) {
                    var ipoint = FindCircleCircleintersection(arcpointdatalist[id].Middle, arcpointdatalist[id].Offset, arcpointdatalist[i].Middle, arcpointdatalist[i].Offset);
                    var vec = ipoint.subtract(point);
                    if (bestvec == null) {
                        bestvec = vec;
                        bestid = i;
                        bestpoint = ipoint;
                        debugger;
                    }
                    else {
                        var angle = bestvec.getDirectedAngle(vec); // vec.getDirectedAngle(bestvec);
                        debugger;
                        if (angle >= 0 && arcpointdatalist[i].Offset < 0) {
                            bestvec = vec;
                            bestid = i;
                            bestpoint = ipoint;
                        }
                        if (angle == 0 && point.getDistance(ipoint) < point.getDistance(bestpoint)) {
                            bestvec = vec;
                            bestid = i;
                            bestpoint = ipoint;
                        }
                        if (angle <= 0 && arcpointdatalist[i].Offset > 0) {
                            bestvec = vec;
                            bestid = i;
                            bestpoint = ipoint;
                        }
                        debugger;
                    }
                }
            }
            if (bestid == -1) {
                return null;
            }
            else if (bestid > id + 1) {
                //    console.log("trimming");
                var count = (bestid - id) - 1;
                arcpointdatalist.splice(id + 1, count);
            }
            return bestpoint;
        }
        var points = [startpos];
        for (var i = 0; i < arcpointdatalist.length - 1; i++) {
            //    console.log("i:" + i);
            points.push(RemoveArcsFromIdToBest(points[points.length - 1], i));
            if (points[points.length - 1] == null) {
                console.log("couldnt find next arc");
                break;
            }
        }
        points.push(endpos);
        for (var i = 0; i < arcpointdatalist.length - 1; i++) {
            paths.push(GetArc(arcpointdatalist[i].Middle, arcpointdatalist[i].Offset, points[i], points[i + 1]));
        }
    }
    var segs = [];
    for (var i = 0; i < paths.length; i++) {
        segs = segs.concat(paths[i].segments);
    }
    var path = MakePathFromSegments(segs);
    return path;
}
exports.GetArcPath = GetArcPath;
// finds where two circles would intersect
function FindCircleCircleintersection(center1, radius1, center2, radius2) {
    var x0 = center1.x;
    var y0 = center1.y;
    var r0 = Math.abs(radius1);
    var x1 = center2.x;
    var y1 = center2.y;
    var r1 = Math.abs(radius2);
    var a, dx, dy, d, h, rx, ry;
    var x2, y2;
    /* dx and dy are the vertical and horizontal distances between
     * the circle centers.
     */
    dx = x1 - x0;
    dy = y1 - y0;
    /* Determine the straight-line distance between the centers. */
    d = Math.sqrt((dy * dy) + (dx * dx));
    /* Check for solvability. */
    if (d > (r0 + r1)) {
        /* no solution. circles do not intersect. */
        return null;
    }
    if (d < Math.abs(r0 - r1)) {
        /* no solution. one circle is contained in the other */
        return null;
    }
    /* 'point 2' is the point where the line through the circle
     * intersection points crosses the line between the circle
     * centers.
     */
    /* Determine the distance from point 0 to point 2. */
    a = ((r0 * r0) - (r1 * r1) + (d * d)) / (2.0 * d);
    /* Determine the coordinates of point 2. */
    x2 = x0 + (dx * a / d);
    y2 = y0 + (dy * a / d);
    /* Determine the distance from point 2 to either of the
     * intersection points.
     */
    h = Math.sqrt((r0 * r0) - (a * a));
    /* Now determine the offsets of the intersection points from
     * point 2.
     */
    rx = -dy * (h / d);
    ry = dx * (h / d);
    /* Determine the absolute intersection points. */
    var xi = x2 + rx;
    var xi_prime = x2 - rx;
    var yi = y2 + ry;
    var yi_prime = y2 - ry;
    //debugger;
    if (radius1 >= 0 && radius2 >= 0) {
        return new paper.Point(xi_prime, yi_prime);
    }
    if (radius1 <= 0 && radius2 <= 0) {
        return new paper.Point(xi, yi);
    }
    // [xi, xi_prime, yi, yi_prime];
}
// sets the sign of the angle, and makes it in the range -180 to +180
function SetAngleSign(angle, sign) {
    if (angle < 0 && sign > 0) {
        angle = 360 + angle;
    }
    if (angle > 0 && sign < 0) {
        angle = angle - 360;
    }
    return angle;
}
exports.SetAngleSign = SetAngleSign;
// simply makes a arc
function GetArc(middle, radius, pointorangle1, pointorangle2) {
    var absradius = Math.abs(radius);
    if (util.isNumber(pointorangle1)) {
        var tpoint = new paper.Point(absradius, 0);
        tpoint = tpoint.rotate(pointorangle1);
        pointorangle1 = tpoint.add(middle);
    }
    if (util.isNumber(pointorangle2)) {
        var tpoint = new paper.Point(absradius, 0);
        tpoint = tpoint.rotate(pointorangle2);
        pointorangle2 = tpoint.add(middle);
    }
    var l1 = pointorangle1.subtract(middle);
    var l2 = pointorangle2.subtract(middle);
    var anglediff = SetAngleSign(l1.getDirectedAngle(l2) / 2, radius); // shortest route
    var l3 = l1.rotate(anglediff);
    var path = new paper.Path();
    path.moveTo(pointorangle1);
    path.arcTo(l3.add(middle), pointorangle2);
    return path;
}
//# sourceMappingURL=ToolBox.js.map
