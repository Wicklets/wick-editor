/*
 Copyright (c) 2014-2017, Jan Bösenberg & Jürg Lehni

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

var OffsetUtils = new function() {
    // had to add these so we don't have to attach paper to the window - zrispo
    var Path = paper.Path;
    var Segment = paper.Segment;
    var Line = paper.Line;

    var errorThreshold = 0.1,
        epsilon = 1e-12;
        geomEpsilon = 1e-8,
        abs = Math.abs,
        enforeArcs = false;

    function offsetPath(path, offset, dontMerge) {
        var result = new Path({ insert: false }),
            curves = path.getCurves(),
            strokeJoin = path.getStrokeJoin(),
            miterLimit = path.getMiterLimit();
        for (var i = 0, l = curves.length; i < l; i++) {
            var curve = curves[i];
            if (curve.hasLength(geomEpsilon)) {
                var segments = getOffsetSegments(curve, offset);
                if (!result.isEmpty()) {
                    connect(result, segments.shift(), curve.segment1,
                            offset, strokeJoin, miterLimit, true);
                }
                result.addSegments(segments);
            }
        }
        if (path.isClosed() && !result.isEmpty()) {
            connect(result, result.firstSegment, path.firstSegment,
                    offset, strokeJoin, miterLimit);
            if (dontMerge) {
                result.setClosed(true);
            } else {
                result.closePath();
            }
        }
        return result;
    }

    function connect(path, dest, originSegment, offset, type, miterLimit,
            addLine) {
        function fixHandles(seg) {
            var handleIn = seg.handleIn,
                handleOut = seg.handleOut;
            if (handleIn.length < handleOut.length) {
                seg.handleIn = handleIn.project(handleOut);
            } else {
                seg.handleOut = handleOut.project(handleIn);
            }
        }

        function addPoint(point) {
            if (!point.equals(path.lastSegment.point)) {
                path.add(point);
            }
        }

        var center = originSegment.point,
            start = path.lastSegment,
            pt1 = start.point,
            pt2 = dest.point,
            connected = false;

        if (!pt1.isClose(pt2, geomEpsilon)) {
            if (enforeArcs
                    // decide if the join is inside or outside the stroke
                    // by checking on which side of the line connecting pt1
                    // and pt2 the center lies.
                    || new Line(pt1, pt2).getSignedDistance(center)
                        * offset <= geomEpsilon) {
                // Calculate the through point based on the vectors from center
                // to pt1 / pt2
                var radius = abs(offset);
                switch (type) {
                case 'round':
                    // Try adding the vectors together to get the average vector
                    // which can be normalized to radius length to get the
                    // through point except if the two vectors have 180° between
                    // them, in which case we can rotate one of them by 90°.
                    var v1 = pt1.subtract(center),
                        v2 = pt2.subtract(center),
                        v = v1.add(v2),
                        through = v.getLength() < geomEpsilon
                                ? v2.rotate(90).add(center)
                                : center.add(v.normalize(radius));
                    path.arcTo(through, pt2);
                    break;
                case 'miter':
                    Path._addBevelJoin(originSegment, 'miter', radius, 4,
                            null, null, addPoint);
                    break;
                case 'square':
                    Path._addSquareCap(originSegment, 'square', radius,
                            null, null, addPoint);
                    break;
                default: // 'bevel' / 'butt'
                    path.lineTo(pt2);
                }
                connected = true;
            } else if (addLine) {
                path.lineTo(pt2);
                connected = true;
            }
            if (connected) {
                fixHandles(start);
                var last = path.lastSegment;
                fixHandles(last);
                // Adjust handleOut, except for when connecting back to the
                // beginning on closed paths.
                if (dest !== path.firstSegment) {
                    last.handleOut = dest.handleOut;
                }
            }
        }
        return connected;
    }

    function joinOffsets(outerPath, innerPath, originPath, offset) {
        outerPath.closed = innerPath.closed = false;
        var path = outerPath,
            open = !originPath.closed,
            strokeCap = originPath.strokeCap;
        path.reverse();
        if (open) {
            connect(path, innerPath.firstSegment, originPath.firstSegment,
                    offset, strokeCap);
        }
        path.join(innerPath);
        if (open) {
            connect(path, path.firstSegment, originPath.lastSegment,
                    offset, strokeCap);
        }
        path.closePath();
        return path;
    }

    function cleanupPath(path) {
        path.children.forEach(function(child) {
            if (Math.abs(child.area) < errorThreshold)
                child.remove();
        });
    }

    /**
     * Creates an offset for the specified curve and returns the segments of
     * that offset path.
     *
     * @param {Curve} curve the curve to be offset
     * @param {Number} offset the offset distance
     * @returns {Segment[]} an array of segments describing the offset path
     */
    function getOffsetSegments(curve, offset) {
        if (curve.isStraight()) {
            var n = curve.getNormalAtTime(0.5).multiply(offset),
                p1 = curve.point1.add(n),
                p2 = curve.point2.add(n);
            return [new Segment(p1), new Segment(p2)];
        } else {
            var curves = splitCurveForOffseting(curve),
                segments = [];
            for (var i = 0, l = curves.length; i < l; i++) {
                var offsetCurves = getOffsetCurves(curves[i], offset, 0),
                    prevSegment;
                for (var j = 0, m = offsetCurves.length; j < m; j++) {
                    var curve = offsetCurves[j],
                        segment = curve.segment1;
                    if (prevSegment) {
                        prevSegment.handleOut = segment.handleOut.project(
                                prevSegment.handleIn);
                    } else {
                        segments.push(segment);
                    }
                    segments.push(prevSegment = curve.segment2);
                }
            }
            return segments;
        }
    }

    function getOffsetCurves(curve, offset) {
        var radius = abs(offset);

        function getOffsetPoint(v, t) {
            return Curve.getPoint(v, t).add(
                    Curve.getNormal(v, t).multiply(offset));
         }

        /**
         * Approach for Curve Offsetting based on:
         *   "A New Shape Control and Classification for Cubic Bézier Curves"
         *   Shi-Nine Yang and Ming-Liang Huang
         */
        function offsetAndSubdivide(curve, curves) {
            var v = curve.getValues(),
                ps = [getOffsetPoint(v, 0), getOffsetPoint(v, 1)],
                ts = [Curve.getTangent(v, 0), Curve.getTangent(v, 1)],
                pt = getOffsetPoint(v, 0.5),
                div = ts[0].cross(ts[1]) * 3 / 4,
                d = pt.add(pt).subtract(ps[0].add(ps[1])),
                a = d.cross(ts[1]) / div,
                b = d.cross(ts[0]) / div,
                hs = [ts[0].multiply(a), ts[1].multiply(-b)];

            // If the two handles end up pointing into opposite directions,
            // reset the shorter one to avoid tiny loops at singularities,
            // and make sure the other handle does not cross the tangent.
            if (a < 0 && b > 0 || a > 0 && b < 0) {
                var flip = abs(a) > abs(b),
                    i1 = flip ? 0 : 1, // index of the longer handle
                    i2 = i1 ^ 1, // index of the shorter handle
                    p = ps[i1],
                    h = hs[i1],
                    cross = new Line(p, h, true).intersect(
                        new Line(ps[i2], ts[i2], true), true);
                // Reset the shorter handle.
                hs[i2] = null;
                // See if the longer handle crosses the other tangent, and if so
                // scale it to avoid crossing and hence producing tiny loops.
                if (cross) {
                    var nh = cross.subtract(p),
                        scale = nh.dot(h) / h.dot(h);
                    if (0 < scale && scale < 1) {
                        hs[i1] = nh;
                    }
                }
            }

            // Now create the offset curve, sample the maximum error, and keep
            // subdividing if it is too large.
            var offsetCurve = new Curve(ps[0], hs[0], hs[1], ps[1]),
                error = getOffsetError(v, offsetCurve.getValues(), radius);
            if (error > errorThreshold
                    // If the whole curve is shorter than the error, ignore
                    // offsetting errors and stop iterating now. This simple
                    // measure along with checks of a and b above fixes all
                    // singularity issues.
                    && offsetCurve.getLength() > errorThreshold) {
                var curve2 = curve.divideAtTime(getAverageTangentTime(v));
                offsetAndSubdivide(curve, curves);
                offsetAndSubdivide(curve2, curves);
            } else {
                curves.push(offsetCurve);
            }
            return curves;
        }

        return offsetAndSubdivide(curve, []);
    }

    function getOffsetError(cv, ov, radius) {
        var count = 16,
            error = 0;
        for (var i = 1; i < count; i++) {
            var t = i / count,
                p = Curve.getPoint(cv, t),
                n = Curve.getNormal(cv, t),
                roots = Curve.getCurveLineIntersections(ov,
                        p.x, p.y, n.x, n.y),
                dist = 2 * radius;
            for (var j = 0, l = roots.length; j < l; j++) {
                var d = Curve.getPoint(ov, roots[j]).getDistance(p);
                if (d < dist)
                    dist = d;
            }
            var err = abs(radius - dist);
            if (err > error)
                error = err;
        }
        return error;
    }

    /**
     * Split curve into sections that can then be treated individually by an
     * offset algorithm.
     */
    function splitCurveForOffseting(curve) {
        var curves = [curve.clone()]; // Clone so path is not modified.
        if (curve.isStraight())
            return curves;

        function splitAtRoots(index, roots, noHandles) {
            for (var i = 0, prevT, l = roots && roots.length; i < l; i++) {
                var t = roots[i];
                var curve = curves[index].divideAtTime(
                            // Renormalize curve-time for multiple roots:
                            i ? (t - prevT) / (1 - prevT) : t);
                prevT = t;
                if (curve) {
                    curves.splice(++index, 0, curve);
                }
            }
        }

        // Recursively splits the specified curve if the angle between the two
        // handles is too large (we use 60° as a threshold).
        function splitLargeAngles(index, recursion) {
            var curve = curves[index],
                v = curve.getValues(),
                n1 = Curve.getNormal(v, 0),
                n2 = Curve.getNormal(v, 1).negate(),
                cos = n1.dot(n2);
            if (cos > -0.5 && ++recursion < 4) {
                curves.splice(index + 1, 0,
                        curve.divideAtTime(getAverageTangentTime(v)));
                splitLargeAngles(index + 1, recursion);
                splitLargeAngles(index, recursion);
            }
        }

        // Split curves at cusps and inflection points.
        var info = curve.classify(),
            roots = info.roots;
        if (roots && info.type !== 'loop') {
            splitAtRoots(0, roots);
        }

        // Split sub-curves at peaks.
        var getPeaks = Curve.getPeaks;
        for (var i = curves.length - 1; i >= 0; i--) {
            splitAtRoots(i, getPeaks(curves[i].getValues()));
        }

        // Split sub-curves with too large angle between handles.
        for (var i = curves.length - 1; i >= 0; i--) {
            splitLargeAngles(i, 0);
        }
        return curves;
    }

    /**
     * Returns the first curve-time where the curve has its tangent in the same
     * direction as the average of the tangents at its beginning and end.
     */
    function getAverageTangentTime(v) {
        var tan = Curve.getTangent(v, 0).add(
                    Curve.getTangent(v, 0.5)).add(
                    Curve.getTangent(v, 1)),
            tx = tan.x,
            ty = tan.y,
            flip = abs(ty) < abs(tx),
            s = flip ? ty / tx : tx / ty,
            ia = flip ? 1 : 0, // the abscissa index
            io = ia ^ 1,       // the ordinate index
            a0 = v[ia + 0], o0 = v[io + 0],
            a1 = v[ia + 2], o1 = v[io + 2],
            a2 = v[ia + 4], o2 = v[io + 4],
            a3 = v[ia + 6], o3 = v[io + 6],
            aA =     -a0 + 3 * a1 - 3 * a2 + a3,
            aB =  3 * a0 - 6 * a1 + 3 * a2,
            aC = -3 * a0 + 3 * a1,
            oA =     -o0 + 3 * o1 - 3 * o2 + o3,
            oB =  3 * o0 - 6 * o1 + 3 * o2,
            oC = -3 * o0 + 3 * o1,
            roots = [],
            epsilon = Numerical.CURVETIME_EPSILON,
            count = Numerical.solveQuadratic(
                    3 * (aA - s * oA),
                    2 * (aB - s * oB),
                    aC - s * oC, roots,
                    epsilon, 1 - epsilon);
        // Fall back to 0.5, so we always have a place to split...
        return count > 0 ? roots[0] : 0.5;
    }

    return {
        offsetPath: offsetPath,
        joinOffsets: joinOffsets,
        cleanupPath: cleanupPath
    };
};
