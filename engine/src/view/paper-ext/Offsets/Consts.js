"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MY_EPSILON = 1e-15;
exports.MIN_PATH_LENGTH = 1e-6; // used when splitting curves, and for logic to see if we think its a real path when using bool operations
exports.LINE_TOLERANCE = 1e-7; // used for smoothing curves
exports.OFFSET_SHIFT = 1e-4; // used for self intersecting paths, we make a slighly differnt path and check for intersects
exports.ONE_THIRD = 1 / 3;
exports.TWO_THIRD = 2 / 3;
// ToDo
// is it possible when making a arcpath that two joining arcs have a plus and minus offset? havn't codid for that possabiliy
// simple offset doesnt work well in some cases, but since we most often break curves into lines, it works alright
//a problem with simple offset with two differnt offsets, atm using path smoothing as a quick fix but its not good
//# sourceMappingURL=Consts.js.map