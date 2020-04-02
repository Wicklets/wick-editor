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

        var vcamPaths = [
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

        vcamPaths.forEach(vcamPath => {
            vcam.activeFrame.addPath(new Wick.Path({path:vcamPath}));
        });

        var vcamScript = "";
        vcamScript += "// Wick VCam Beta v0.01\n";
        vcamScript += "\n";
        vcamScript += "// Make the VCam invisible\n";
        vcamScript += "this.opacity = 0;\n";
        vcamScript += "\n";
        vcamScript += "// Adjust pan and zoom so that only what is inside the vcam is visible\n";
        vcamScript += "project.project.zoom = 1/this.scaleX;\n";
        vcamScript += "project.project.pan.x = -(this.x - project.width/2);\n";
        vcamScript += "project.project.pan.y = -(this.y - project.height/2);\n";
        vcam.addScript('update', vcamScript);

        return vcam;
    }
}

Wick.BuiltinAssets = new BuiltinAssets();
