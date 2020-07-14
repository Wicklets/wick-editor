"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require('util');
const paper = require('paper-jsdom');
const toolbox = require('./ToolBox');
const constants = require('./Consts');
// gets the point between this and the other by given percentage
paper.Point.prototype.Lerp = function (other, percentage) {
    if (this.equals(other)) {
        return other;
    }
    return this.add((other.subtract(this)).multiply(percentage));
};
// simple offset,
// if offsets same :
//                  get line from start to global handle 1, from global handle1 to global handle2, from global handle2 to end
//                  shift them all by normal
//                  point1 then equals begining of first line
//                  point2 then equals ending of last line
//                  handle1 then equals where line 1 and 2 intersect
//                  handle2 then equals where line 2 and 3 intersect
// if offsets differnt : we get curve for both offsets and shunt them, works ok most the time, except when its close to but not a line
paper.Curve.prototype.SimpleOffset = function (startoffset, endoffset = null) {
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
        return toolbox.GetCurveLine(this.point1.add(norm), this.point2.add(norm));
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
};
// breaks a curve into smaller curves untill all curves are near enough to a line
paper.Curve.prototype.RecursiveDivide = function (flattolerance) {
    if (this.bounds.center.isClose(this.getPointAtTime(0.5), flattolerance)) {
        return [this.clone()];
    }
    var halves = this.SplitAtTimes([0.5]);
    return halves[0].RecursiveDivide(flattolerance).concat(halves[1].RecursiveDivide(flattolerance));
};
// gets part of a curve
paper.Curve.prototype.GetPart = function (start, end) {
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
};
// taken from example code, just splits a curve at the times and returns a list
paper.Curve.prototype.SplitAtTimes = function (timelist) {
    var curvelist = [];
    if (!util.isArray(timelist)) {
        timelist = [timelist];
    }
    timelist.sort(function (a, b) { return a - b; });
    if (this.isStraight()) {
        timelist.splice(0, 0, 0);
        timelist.push(1);
        for (var i = 0; i < timelist.length - 1; i++) {
            var p1 = this.getPointAtTime(timelist[i]);
            var p2 = this.getPointAtTime(timelist[i + 1]);
            curvelist.push(toolbox.GetCurveLine(p1, p2));
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
};
// splits curve where curviture is more than offset
// then trims the curves based on the offset 
// then splits them into smaller peices untill there near enough a line
// then offsets them
// then returns them as a path
paper.Curve.prototype.ComplexOffset = function (startoffset, endoffset = null) {
    var usesmoothing = endoffset == null || endoffset != startoffset;
    if (endoffset == null) {
        endoffset = startoffset;
    }
    var brokencurves = this.SplitWhereRadiusIsLargerThan(startoffset, endoffset);
    var trimedcurves = toolbox.TrimCurves(brokencurves, startoffset, endoffset, 1);
    var initaloffsets = toolbox.GetOffsetsForCurves(trimedcurves, startoffset, endoffset);
    var tpaths = [];
    var finalcurves = [];
    for (var i = 0; i < trimedcurves.length; i++) {
        var microcurves = trimedcurves[i].RecursiveDivide(0.1);
        var offsets = toolbox.GetOffsetsForCurves(microcurves, initaloffsets[i][0], initaloffsets[i][1]);
        for (var ii = 0; ii < microcurves.length; ii++) {
            microcurves[ii] = microcurves[ii].SimpleOffset(offsets[ii][0], offsets[ii][1]); //(startoffset); // should be using ii
            tpaths.push(toolbox.MakePathFromCurves(microcurves[ii]));
        }
        finalcurves = finalcurves.concat(microcurves);
    }
    if (finalcurves.length == 0) {
        return null;
    }
    var pp = toolbox.MakePathFromCurves(finalcurves);
    if (usesmoothing) {
        pp.simplify(constants.LINE_TOLERANCE); //.smooth({ type: 'continuous' });
    }
    return pp;
};
// splits a curve where a curves curviture is larger than the offset
paper.Curve.prototype.SplitWhereRadiusIsLargerThan = function (startoffset, endoffset = null) {
    if (endoffset == null) {
        endoffset = startoffset;
    }
    var initialpeaktimes = paper.Curve.getPeaks(this.getValues());
    var peaktimes = [];
    for (var i = 0; i < initialpeaktimes.length; i++) {
        var radiuscurviture = 1 / toolbox.Lerp(startoffset, endoffset, initialpeaktimes[i]);
        var curvecurviture = this.getCurvatureAtTime(initialpeaktimes[i]);
        if (Math.sign(radiuscurviture) != Math.sign(curvecurviture) && Math.abs(curvecurviture) >= Math.abs(radiuscurviture) && curvecurviture != 0) {
            peaktimes.push(initialpeaktimes[i]);
        }
    }
    return this.SplitAtTimes(peaktimes);
};
// checks if bounding boxes could intersect taking into account offset
paper.Curve.prototype.AnyChanceBBoxWillIntersect = function (othercurve, expandamount) {
    expandamount = Math.abs(expandamount);
    var bb1 = this.bounds.expand(expandamount);
    var bb2 = othercurve.bounds.expand(expandamount);
    return bb1.intersects(bb2);
};
// gets the shortest distance between two curves
paper.Curve.prototype.GetShortestDistanceBetween = function (othercurve) {
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
};
// splits path
paper.Path.prototype.SplitPathAtPoint = function (Point) {
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
    if (path1.length < constants.MIN_PATH_LENGTH || path1.segments <= 1) {
        path1 = null;
    }
    if (path2.length < constants.MIN_PATH_LENGTH || path2.segments <= 1) {
        path2 = null;
    }
    return [path1, path2];
};
// gets shortest distance between paths
paper.Path.prototype.GetShortestDistanceBetween = function (path) {
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
};
// gets the shortest distance between curves inside itself, ignoring the curves each curve is attached to
paper.Path.prototype.GetShortestDistanceWithinMe = function () {
    var closest = Number.MAX_SAFE_INTEGER;
    for (var i = 0; i < this.curves.length; i++) {
        var forwardindex = toolbox.MIB(i + 1, this.curves.length);
        var backwardindex = toolbox.MIB(i - 1, this.curves.length);
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
};
// offsets the compound paths, uses path offset on each child path then joins them all together
paper.CompoundPath.prototype.Offset = function (beginingoffset, endingoffset) {
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
        if (returnpath.children[i].length < constants.MIN_PATH_LENGTH) {
            return null;
        }
    }
    return returnpath;
};
// offsets a path, first gets trim times 
// trims each curve based on other curves,
// then trims itself
// then if theres any curve left its addid
// between each curve we check where they meet, and if they expand we put them in a list
// so we find all the cornermeets between two curves which still exist
// then create a path from all the corners and put it in the main list
// we also create this path again but with a slight differnce in offset
// and use where this path crosses our original path to see if we should remove parts
paper.Path.prototype.Offset = function (beginingoffset, endingoffset, depth = 0) {
    // console.log("depth " + depth);
    var openpath = Number(!this.closed);
    var curves = this.clone().curves;
    var offsets = toolbox.GetOffsetsForCurves(curves, beginingoffset, endingoffset);
    var trimtimes = toolbox.GetTrimTimesForCurves(curves, beginingoffset, endingoffset, openpath);
    var arcpointdatalist = [];
    var arcstartpos = null;
    var segs = [];
    for (var i1 = 0; i1 < curves.length * 2; i1++) {
        var i2 = toolbox.MIB(i1, curves.length);
        if (openpath == 1 && i1 >= curves.length) {
            break;
        }
        if (trimtimes[i2][0] < trimtimes[i2][1]) {
            var curvepath = curves[i2].GetPart(trimtimes[i2][0], trimtimes[i2][1]);
            curvepath = curvepath.ComplexOffset(offsets[i2][0], offsets[i2][1]);
            if (curvepath != null) {
                if (arcpointdatalist.length > 0 && arcstartpos != null) {
                    var arcpath = toolbox.GetArcPath(arcpointdatalist, arcstartpos, curvepath.firstSegment.point);
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
        var arcpointdata = toolbox.GetCurveCurvePointData(curves[i2], curves[toolbox.MIB(i2 + 1, curves.length)], offsets[i2][1], i2);
        if (arcpointdata.NeedArc && arcstartpos != null) {
            arcpointdatalist.push(arcpointdata);
        }
    }
    if (segs.length < 2) {
        return null;
    }
    var path = toolbox.MakePathFromSegments(segs);
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
            modi = beginingoffset - constants.OFFSET_SHIFT;
        }
        else if (this.clockwise && beginingoffset < 0) {
            modi = beginingoffset + constants.OFFSET_SHIFT;
        }
        else if (!this.clockwise && beginingoffset > 0) {
            modi = beginingoffset + constants.OFFSET_SHIFT;
        }
        else if (!this.clockwise && beginingoffset < 0) {
            modi = beginingoffset - constants.OFFSET_SHIFT;
        }
        var compath = this.Offset(modi, modi, 1);
        if (!(compoundpath instanceof paper.CompoundPath)) {
            compoundpath = new paper.CompoundPath({ children: [compoundpath] });
        }
        if (!(compath instanceof paper.CompoundPath)) {
            compath = new paper.CompoundPath({ children: [compath] });
        }
        for (var i = 0; i < compath.children.length; i++) {
            if (compath.children[i].segments.length < 2 || compath.children[i].length < constants.MIN_PATH_LENGTH) {
                compath.removeChildren(i, i + 1);
                i--;
            }
        }
        for (var i = 0; i < compoundpath.children.length; i++) {
            if (compoundpath.children[i].segments.length < 2 || compoundpath.children[i].length < constants.MIN_PATH_LENGTH) {
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
};
//# sourceMappingURL=PaperJsExtensions.js.map