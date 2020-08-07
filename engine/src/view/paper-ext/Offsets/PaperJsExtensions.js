const MY_EPSILON = 1e-15;
const MIN_PATH_LENGTH = 1e-6; // used when splitting curves, and for logic to see if we think its a real path when using bool operations
const LINE_TOLERANCE = 1e-7; // used for smoothing curves
const OFFSET_SHIFT = 1e-4; // used for self intersecting paths, we make a slighly differnt path and check for intersects
const ONE_THIRD = 1 / 3;
const TWO_THIRD = 2 / 3;

//var util = require('util');



paper.Point.inject({
    //const offsets_constants = require('./Consts');
    // gets the point between this and the other by given percentage
    Lerp: function (other, percentage) {
        if (this.equals(other)) {
            return other;
        }
        return this.add((other.subtract(this)).multiply(percentage));
    }})
    
    
    paper.Curve.inject({
    // simple offset,
    // if offsets same :
    //                  get line from start to global handle 1, from global handle1 to global handle2, from global handle2 to end
    //                  shift them all by normal
    //                  point1 then equals begining of first line
    //                  point2 then equals ending of last line
    //                  handle1 then equals where line 1 and 2 intersect
    //                  handle2 then equals where line 2 and 3 intersect
    // if offsets differnt : we get curve for both offsets and shunt them, works ok most the time, except when its close to but not a line
    SimpleOffset: function (startoffset, endoffset = null) {
        if (endoffset != null) {
            var c1 = this.SimpleOffset(startoffset);
            var c2 = this.SimpleOffset(endoffset);
            return new paper.Curve(c1.segment1, c2.segment2);
        }
        if (startoffset == 0) {
            return this.clone();
        }
        if (this.isStraight()) {
            var norm = this.getNormalAtTime(0).normalize(startoffset);
            return GetCurveLine(this.point1.add(norm), this.point2.add(norm));
        }
        var offset1 = this.handle1.rotate(-90).normalize(startoffset);
        var offset2 = this.point2.subtract(this.point1).rotate(-90).normalize(startoffset);
        var offset3 = this.handle2.rotate(90).normalize(startoffset);
        var globalhandle1 = this.point1.add(this.handle1);
        var globalhandle2 = this.point2.add(this.handle2);
        var l1 = new paper.Line(this.point1.add(offset1), globalhandle1.add(offset1));
        var l2 = new paper.Line(globalhandle1.add(offset2), globalhandle2.add(offset2));
        var l3 = new paper.Line(this.point2.add(offset3), globalhandle2.add(offset3));
        var p1 = l1.getPoint();
        var p2 = l3.getPoint();
        var h1 = l1.intersect(l2, true).subtract(p1);
        var h2 = l2.intersect(l3, true).subtract(p2);
        return new paper.Curve(p1, h1, h2, p2);
    },
    // breaks a curve into smaller curves untill all curves are near enough to a line
    RecursiveDivide: function (flattolerance) {
        if (this.bounds.center.isClose(this.getPointAtTime(0.5), flattolerance)) {
            return [this.clone()];
        }
        var halves = this.SplitAtTimes([0.5]);
        return halves[0].RecursiveDivide(flattolerance).concat(halves[1].RecursiveDivide(flattolerance));
    },
    // gets part of a curve
    GetPart: function (start, end) {
        if (start != 0 && end != 1) {
            return this.SplitAtTimes([start, end])[1];
        }
        if (start != 0) {
            return this.SplitAtTimes([start])[1];
        }
        if (end != 1) {
            return this.SplitAtTimes([end])[0];
        }
        return this.clone();
    },
    // taken from example code, just splits a curve at the times and returns a list
    SplitAtTimes: function (timelist) {
        var curvelist = [];
        if (!Array.isArray(timelist)) {
            timelist = [timelist];
        }
        timelist.sort(function (a, b) { return a - b; });
        if (this.isStraight()) {
            timelist.splice(0, 0, 0);
            timelist.push(1);
            for (var i = 0; i < timelist.length - 1; i++) {
                var p1 = this.getPointAtTime(timelist[i]);
                var p2 = this.getPointAtTime(timelist[i + 1]);
                curvelist.push(GetCurveLine(p1, p2));
            }
        }
        else {
            curvelist = [this.clone()];
            var index = 0;
            for (var i = 0, prevT, l = timelist && timelist.length; i < l; i++) {
                var t = timelist[i];
                var curve = curvelist[index].divideAtTime(i ? (t - prevT) / (1 - prevT) : t);
                prevT = t;
                if (curve) {
                    curvelist.splice(++index, 0, curve);
                }
            }
        }
        return curvelist;
    },
    // splits curve where curviture is more than offset
    // then trims the curves based on the offset 
    // then splits them into smaller peices untill there near enough a line
    // then offsets them
    // then returns them as a path
    ComplexOffset: function (startoffset, endoffset = null) {
        var usesmoothing = endoffset == null || endoffset != startoffset;
        if (endoffset == null) {
            endoffset = startoffset;
        }
        var brokencurves = this.SplitWhereRadiusIsLargerThan(startoffset, endoffset);
        var trimedcurves = TrimCurves(brokencurves, startoffset, endoffset, 1);
        var initaloffsets = GetOffsetsForCurves(trimedcurves, startoffset, endoffset);
        var tpaths = [];
        var finalcurves = [];
        for (var i = 0; i < trimedcurves.length; i++) {
            var microcurves = trimedcurves[i].RecursiveDivide(0.1);
            var offsets = GetOffsetsForCurves(microcurves, initaloffsets[i][0], initaloffsets[i][1]);
            for (var ii = 0; ii < microcurves.length; ii++) {
                microcurves[ii] = microcurves[ii].SimpleOffset(offsets[ii][0], offsets[ii][1]); //(startoffset); // should be using ii
                tpaths.push(MakePathFromCurves(microcurves[ii]));
            }
            finalcurves = finalcurves.concat(microcurves);
        }
        if (finalcurves.length == 0) {
            return null;
        }
        var pp = MakePathFromCurves(finalcurves);
        if (usesmoothing) {
            pp.simplify(LINE_TOLERANCE); //.smooth({ type: 'continuous' });
        }
        return pp;
    },
    // splits a curve where a curves curviture is larger than the offset
    SplitWhereRadiusIsLargerThan: function (startoffset, endoffset = null) {
        if (endoffset == null) {
            endoffset = startoffset;
        }
        var initialpeaktimes = paper.Curve.getPeaks(this.getValues());
        var peaktimes = [];
        for (var i = 0; i < initialpeaktimes.length; i++) {
            var radiuscurviture = 1 / Lerp(startoffset, endoffset, initialpeaktimes[i]);
            var curvecurviture = this.getCurvatureAtTime(initialpeaktimes[i]);
            if (Math.sign(radiuscurviture) != Math.sign(curvecurviture) && Math.abs(curvecurviture) >= Math.abs(radiuscurviture) && curvecurviture != 0) {
                peaktimes.push(initialpeaktimes[i]);
            }
        }
        return this.SplitAtTimes(peaktimes);
    },
    // checks if bounding boxes could intersect taking into account offset
    AnyChanceBBoxWillIntersect: function (othercurve, expandamount) {
        expandamount = Math.abs(expandamount);
        var bb1 = this.bounds.expand(expandamount);
        var bb2 = othercurve.bounds.expand(expandamount);
        return bb1.intersects(bb2);
    },
    // gets the shortest distance between two curves
    GetShortestDistanceBetween: function (othercurve) {
        /// get the shortest curve
        var chosencurve = Number(othercurve.length < this.length); // 0 is me, 1 is other for shortest
        var c1, c2;
        if (chosencurve) {
            c1 = othercurve;
            c2 = this;
        }
        else {
            c1 = this;
            c2 = othercurve;
        }
        var bestdistance = Number.MAX_VALUE;
        var bestpointc1 = null;
        var bestpointc2 = null;
        var distance = 0;
        // get ten points on the smallest curve and get nearest point to the other, and save the closest
        for (var i = 0; i <= 1.0; i += 0.1) {
            var c1point = c1.getPointAtTime(i);
            var c2point = c2.getNearestPoint(c1point);
            distance = c2point.getDistance(c1point);
            if (distance < bestdistance) {
                bestdistance = distance;
                bestpointc1 = c1point;
                bestpointc2 = c2point;
            }
        }
        /// should already have a close point but now use nearestpoint on each other to refine
        var olddistance = Number.MAX_VALUE;
        var maxcount = 100;
        while (olddistance != distance && maxcount > 0) {
            olddistance = distance;
            bestpointc2 = c2.getNearestPoint(bestpointc1);
            bestpointc1 = c1.getNearestPoint(bestpointc2);
            distance = bestpointc1.getDistance(bestpointc2);
            maxcount--;
        }
        // account for swapping curves in the data sent back
        if (chosencurve) // other is shortest
         {
            return { MyPos: bestpointc2, OtherPos: bestpointc1, Distance: distance };
        }
        else {
            return { MyPos: bestpointc1, OtherPos: bestpointc2, Distance: distance };
        }
    }});
    
    paper.Path.inject({
    // splits path
    SplitPathAtPoint: function (Point) {
        var clone = this.clone();
        var location = clone.getNearestLocation(Point);
        var splitseg = clone.divideAt(location);
        if (splitseg == null) {
            splitseg = location.segment;
        }
        var index = splitseg.index;
        var segs1 = clone.segments.slice(0, index + 1);
        var segs2 = clone.segments.slice(index, clone.segments.length);
        var path1 = new paper.Path(segs1);
        var path2 = new paper.Path(segs2);
        if (path1.length < MIN_PATH_LENGTH || path1.segments <= 1) {
            path1 = null;
        }
        if (path2.length < MIN_PATH_LENGTH || path2.segments <= 1) {
            path2 = null;
        }
        return [path1, path2];
    },
    // gets shortest distance between paths
    GetShortestDistanceBetween: function (path) {
        var closest = Number.MAX_SAFE_INTEGER;
        for (var i = 0; i < this.curves.length; i++) {
            for (var ii = 0; ii < path.curves.length; ii++) {
                var d = this.curves[i].GetShortestDistanceBetween(path.curves[ii]);
                if (d.Distance < closest) {
                    closest = d.Distance;
                }
            }
        }
        return closest;
    },
    // gets the shortest distance between curves inside itself, ignoring the curves each curve is attached to
    GetShortestDistanceWithinMe: function () {
        var closest = Number.MAX_SAFE_INTEGER;
        for (var i = 0; i < this.curves.length; i++) {
            var forwardindex = MIB(i + 1, this.curves.length);
            var backwardindex = MIB(i - 1, this.curves.length);
            for (var ii = 0; ii < this.curves.length; ii++) {
                //   debugger;
                if (i != ii && ii != forwardindex && ii != backwardindex) {
                    //  console.log("checking");
                    var d = this.curves[i].GetShortestDistanceBetween(this.curves[ii]);
                    if (d.Distance < closest) {
                        //   debugger;
                        closest = d.Distance;
                    }
                }
            }
        }
        return closest;
    },
    // offsets a path, first gets trim times 
    // trims each curve based on other curves,
    // then trims itself
    // then if theres any curve left its addid
    // between each curve we check where they meet, and if they expand we put them in a list
    // so we find all the cornermeets between two curves which still exist
    // then create a path from all the corners and put it in the main list
    // we also create this path again but with a slight differnce in offset
    // and use where this path crosses our original path to see if we should remove parts
    Offset: function (beginingoffset, endingoffset, depth = 0) {
        // console.log("depth " + depth);
        var openpath = Number(!this.closed);
        var curves = this.clone().curves;
        var offsets = GetOffsetsForCurves(curves, beginingoffset, endingoffset);
        var trimtimes = GetTrimTimesForCurves(curves, beginingoffset, endingoffset, openpath);
        var arcpointdatalist = [];
        var arcstartpos = null;
        var segs = [];
        for (var i1 = 0; i1 < curves.length * 2; i1++) {
            var i2 = MIB(i1, curves.length);
            if (openpath == 1 && i1 >= curves.length) {
                break;
            }
            if (trimtimes[i2][0] < trimtimes[i2][1]) {
                var curvepath = curves[i2].GetPart(trimtimes[i2][0], trimtimes[i2][1]);
                curvepath = curvepath.ComplexOffset(offsets[i2][0], offsets[i2][1]);
                if (curvepath != null) {
                    if (arcpointdatalist.length > 0 && arcstartpos != null) {
                        var arcpath = GetArcPath(arcpointdatalist, arcstartpos, curvepath.firstSegment.point);
                        segs = segs.concat(arcpath.segments);
                        arcpointdatalist = [];
                    }
                    arcstartpos = curvepath.lastSegment.point;
                    if (i1 < curves.length) {
                        segs = segs.concat(curvepath.segments);
                    }
                    else {
                        break;
                    }
                }
            }
            var arcpointdata = GetCurveCurvePointData(curves[i2], curves[MIB(i2 + 1, curves.length)], offsets[i2][1], i2);
            if (arcpointdata.NeedArc && arcstartpos != null) {
                arcpointdatalist.push(arcpointdata);
            }
        }
        if (segs.length < 2) {
            return null;
        }
        var path = MakePathFromSegments(segs);
        if (openpath == 0) {
            path.closePath();
        }
        if (openpath == 1 || beginingoffset != endingoffset) {
            return path;
        }
        var compoundpath = new paper.CompoundPath();
        compoundpath.addChild(path);
        compoundpath = compoundpath.unite(compoundpath);
        compoundpath = compoundpath.unite(compoundpath); // sometimes it misses some the first time round
        if (beginingoffset == endingoffset && depth == 0 && openpath == 0) {
            var modi = 0;
            if (this.clockwise && beginingoffset > 0) {
                modi = beginingoffset - OFFSET_SHIFT;
            }
            else if (this.clockwise && beginingoffset < 0) {
                modi = beginingoffset + OFFSET_SHIFT;
            }
            else if (!this.clockwise && beginingoffset > 0) {
                modi = beginingoffset + OFFSET_SHIFT;
            }
            else if (!this.clockwise && beginingoffset < 0) {
                modi = beginingoffset - OFFSET_SHIFT;
            }
            var compath = this.Offset(modi, modi, 1);
            if (!(compoundpath instanceof paper.CompoundPath)) {
                compoundpath = new paper.CompoundPath({ children: [compoundpath] });
            }
            if (!(compath instanceof paper.CompoundPath)) {
                compath = new paper.CompoundPath({ children: [compath] });
            }
            for (var i = 0; i < compath.children.length; i++) {
                if (compath.children[i].segments.length < 2 || compath.children[i].length < MIN_PATH_LENGTH) {
                    compath.removeChildren(i, i + 1);
                    i--;
                }
            }
            for (var i = 0; i < compoundpath.children.length; i++) {
                if (compoundpath.children[i].segments.length < 2 || compoundpath.children[i].length < MIN_PATH_LENGTH) {
                    compoundpath.removeChildren(i, i + 1);
                    i--;
                }
            }
            for (var i = 0; i < compath.children.length; i++) {
                for (var ii = 0; ii < compoundpath.children.length; ii++) {
                    if (compath.children[i].getCrossings(compoundpath.children[ii]).length > 0) {
                        compoundpath.removeChildren(ii, ii + 1);
                        ii--;
                    }
                }
            }
            if (compoundpath.children.length == 0) {
                return null;
            }
            //   return compoundpath;
        }
        compoundpath = compoundpath.reorient(false, this.clockwise);
        return compoundpath;
    }
    });
    
    paper.CompoundPath.inject({
    // offsets the compound paths, uses path offset on each child path then joins them all together
    Offset: function (beginingoffset, endingoffset) {
        var clockwisepath = new paper.CompoundPath();
        var anticlockwisepath = new paper.CompoundPath();
        var returnpath = new paper.CompoundPath();
        for (var i = 0; i < this.children.length; i++) {
            //  console.log("doing path " + i);
            var npath = new paper.Path(this.children[i].segments);
            npath.closed = this.children[i].closed;
            var offpath = npath.Offset(beginingoffset, endingoffset);
            if (offpath != null) {
                if (!(offpath instanceof paper.CompoundPath)) {
                    offpath = new paper.CompoundPath({ children: [offpath] });
                }
                for (var ii = 0; ii < offpath.children.length; ii++) {
                    if (offpath.children[ii] != null) {
                        if (offpath.children[ii].clockwise) {
                            clockwisepath = clockwisepath.unite(offpath.children[ii]);
                        }
                        else {
                            anticlockwisepath = anticlockwisepath.unite(offpath.children[ii]);
                        } // reorient([nonZero[, clockwise]])
                    }
                }
            }
        }
        returnpath = clockwisepath.subtract(anticlockwisepath);
        if (!(returnpath instanceof paper.CompoundPath)) {
            returnpath = new paper.CompoundPath({ children: [returnpath] });
        }
        for (var i = 0; i < returnpath.children.length; i++) {
            if (returnpath.children[i].length < MIN_PATH_LENGTH) {
                return null;
            }
        }
        return returnpath;
    }})

function IsClose(a, b, Precision) {
    var diff = Math.abs(a - b);
    return diff < Precision;
}
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
// returns the value between 1 and 2 at the percentage
function Lerp(value1, value2, percentage) {
    return value1 + ((value2 - value1) * percentage);
}
// returns a line as a curve object
function GetCurveLine(p1, p2, asvector = false) {
    if (asvector == true) {
        p2 = p2.add(p1);
    }
    return new paper.Curve(p1, (p1.Lerp(p2, ONE_THIRD)).subtract(p1), (p1.Lerp(p2, TWO_THIRD)).subtract(p2), p2);
}
// makes a path from segments, combines close segments into one
function MakePathFromSegments(segments, tolerance = MY_EPSILON) {
    for (var i = 0; i < segments.length - 1; i++) {
        if (segments[i].point.isClose(segments[i + 1].point, tolerance)) {
            segments[i].handleOut = segments[i + 1].handleOut;
            segments.splice(i + 1, 1);
        }
    }
    return new paper.Path(segments);
}
// makes a path from curves, assumes one curves end is the next curves start
function MakePathFromCurves(curves) {
    if (!Array.isArray(curves)) {
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
// simple save paths function
function SavePaths(paths, filename = "test", multicolor = false, firstblack = false) {
    filename = filename + ".svg";
    if (!Array.isArray(paths)) {
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
            while (!newpos.isClose(oldpos, MY_EPSILON) && newpos != null && count > 0) {
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
// trim curves based on offsets
function TrimCurves(curves, startoffset, endoffset, openpath) {
    if (!Array.isArray(curves)) {
        curves = [curves];
    }
    var returncurves = [];
    var trimtimes = GetTrimTimesForCurves(curves, startoffset, endoffset, openpath);
    for (var i = 0; i < trimtimes.length; i++) {
        if (trimtimes[i][0] < trimtimes[i][1]) {
            console.log(curves[i]);
            returncurves.push(curves[i].GetPart(trimtimes[i][0], [trimtimes[i][1]]));
        }
    }
    return returncurves;
}
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
// simply makes a arc
function GetArc(middle, radius, pointorangle1, pointorangle2) {
    var absradius = Math.abs(radius);
    if (!(pointorangle1._class === 'Point')) {
        var tpoint = new paper.Point(absradius, 0);
        tpoint = tpoint.rotate(pointorangle1);
        pointorangle1 = tpoint.add(middle);
    }
    if (!(pointorangle2._class === 'Point')) {
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






