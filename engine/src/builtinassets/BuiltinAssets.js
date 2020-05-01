/*
 * Copyright 2020 WICKLETS LLC
 *
 * This file is part of Wick Engine.
 *
 * Wick Engine is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Wick Engine is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Global utility class for creating instances of builtin assets.
 */
BuiltinAssets = class {
    generateVcam () {
        var vcam = new Wick.Clip();

        var defaultVcamWH = {width: 720, height: 480};
        var defaultCrosshairSize = 75;

        // Vcam outline (hidden when project plays)
        var vcamBorderPaths = [
            // Cam border
            new paper.Path.Rectangle({
                from: new paper.Point(-defaultVcamWH.width/2, -defaultVcamWH.height/2),
                to: new paper.Point(defaultVcamWH.width/2, defaultVcamWH.height/2),
                strokeWidth: 1,
                strokeColor: '#000',
                fillColor: 'rgba(74,144,226,0.19)',
            }),
            // Cam center crosshair (vertical line)
            new paper.Path.Line({
                from: new paper.Point(0, -defaultCrosshairSize/2),
                to: new paper.Point(0, defaultCrosshairSize/2),
                strokeWidth: 1,
                strokeColor: '#000',
            }),
            // Cam center crosshair (horizontal line)
            new paper.Path.Line({
                from: new paper.Point(-defaultCrosshairSize/2, 0),
                to: new paper.Point(defaultCrosshairSize/2, 0),
                strokeWidth: 1,
                strokeColor: '#000',
            }),
        ];

        vcamBorderPaths.forEach(vcamPath => {
            vcam.activeFrame.addPath(new Wick.Path({path:vcamPath}));
        });

        // Vcam black borders (only visible when project is playing and showBlackBorders is set to true)
        var borderSize = 10000;
        var blackBorderPaths = [
            // Black border top
            new paper.Path.Rectangle({
                from: new paper.Point(-borderSize, -borderSize),
                to: new paper.Point(borderSize, -defaultVcamWH.height/2),
                strokeWidth: 1,
                strokeColor: '#000',
                fillColor: '#000',
            }),
            // Black border bottom
            new paper.Path.Rectangle({
                from: new paper.Point(-borderSize, defaultVcamWH.height/2),
                to: new paper.Point(borderSize, borderSize),
                strokeWidth: 1,
                strokeColor: '#000',
                fillColor: '#000',
            }),
            // Black border left
            new paper.Path.Rectangle({
                from: new paper.Point(-borderSize, -borderSize),
                to: new paper.Point(-defaultVcamWH.width/2, borderSize),
                strokeWidth: 1,
                strokeColor: '#000',
                fillColor: '#000',
            }),
            // Black border right
            new paper.Path.Rectangle({
                from: new paper.Point(defaultVcamWH.width/2, -borderSize),
                to: new paper.Point(borderSize, borderSize),
                strokeWidth: 1,
                strokeColor: '#000',
                fillColor: '#000',
            }),
        ];

        vcam.activeLayer.addFrame(new Wick.Frame({start:2}));
        blackBorderPaths.forEach(vcamPath => {
            vcam.activeLayer.getFrameAtPlayheadPosition(2).addPath(new Wick.Path({path:vcamPath}));
        });

        // Blank frame
        vcam.activeLayer.addFrame(new Wick.Frame({start:3}))

        // Build script
        var vcamScript = "";
        vcamScript += "// Wick VCam Beta v0.02\n";
        vcamScript += "\n";
        vcamScript += "// (optional) set this value to true if you want black bars to\n";
        vcamScript += "// render if the vcam is a different aspect ratio than the project\n";
        vcamScript += "this.showBlackBorders = true;\n";
        vcamScript += "\n";
        vcamScript += "// Save original size of the vcam\n";
        vcamScript += "this.origBounds = this.origBounds || {\n";
        vcamScript += "    width: this.bounds.width,\n";
        vcamScript += "    height: this.bounds.height,\n";
        vcamScript += "}\n";
        vcamScript += "// Hide vcam outline and show black borders (if enabled)\n";
        vcamScript += "this.gotoAndStop(this.showBlackBorders ? 2 : 3);\n";
        vcamScript += "\n";
        vcamScript += "// Hide the projects black bars if needed (the vcam will render its own)\n";
        vcamScript += "this.project.renderBlackBars = false;";
        vcamScript += "// Adjust pan and zoom so that only what is inside the vcam is visible\n";
        vcamScript += "var w = 0;\n";
        vcamScript += "var h = 0;\n";
        vcamScript += "w = this.project.view.canvasDimensions.width;\n";
        vcamScript += "h = this.project.view.canvasDimensions.height;\n";
        vcamScript += "var wr = w / this.origBounds.width/this.scaleX;\n";
        vcamScript += "var hr = h / this.origBounds.height/this.scaleY;\n";
        vcamScript += "this.project.zoom = Math.min(wr, hr);\n";
        vcamScript += "this.project.pan.x = -(this.x - project.width/2);\n";
        vcamScript += "this.project.pan.y = -(this.y - project.height/2);\n";
        vcamScript += "this.project.rotation = -this.rotation;\n";
        vcamScript += "\n";
        vcam.addScript('update', vcamScript);
        vcam.removeScript('default');

        return vcam;
    }
}

Wick.BuiltinAssets = new BuiltinAssets();
