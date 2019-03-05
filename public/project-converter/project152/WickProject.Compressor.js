/* Wick - (c) 2017 Zach Rispoli, Luca Damasco, and Josh Rispoli */

/*  This file is part of Wick. 
    
    Wick is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Wick is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Wick.  If not, see <http://www.gnu.org/licenses/>. */

WickProject.Compressor = (function () {

    var projectCompressor = { };

    var printFilesize = false;

    var compressionRoutines = {
        'LZSTRING-BASE64': {
            compress:LZString.compressToBase64, 
            decompress:LZString.decompressFromBase64
        },
        'LZSTRING-UTF16': {
            compress:LZString.compressToUTF16, 
            decompress:LZString.decompressFromUTF16
        }
    }

    projectCompressor.compressProject = function (projectJSON, compressionRoutineName) {
        if(printFilesize) console.log("Compressing project of size " + projectJSON.length);

        var compressionRoutine = compressionRoutines[compressionRoutineName];
        var compressedProjectJSON = compressionRoutineName+compressionRoutine.compress(projectJSON)

        if(printFilesize) console.log("Done! Result size " + compressedProjectJSON.length);
        return compressedProjectJSON;
    }

    projectCompressor.decompressProject = function (compressedProjectJSON) {
        if(printFilesize) console.log("Decompressing project...")

        var projectJSON = compressedProjectJSON;

        for (var compressionRoutineName in compressionRoutines) {
            if(compressedProjectJSON.startsWith(compressionRoutineName)) {
                console.log("Project compressed with " + compressionRoutineName)
                var compressionRoutine = compressionRoutines[compressionRoutineName];
                var rawCompressedProjectJSON = compressedProjectJSON.substring(compressionRoutineName.length, compressedProjectJSON.length);
                projectJSON = compressionRoutine.decompress(rawCompressedProjectJSON);
            }
        }

        if(printFilesize) console.log("Done!");
        return projectJSON;
    }
    
    projectCompressor.encodeString = function (str) {
        var newStr = str;
        newStr = encodeURI(str);
        newStr = newStr.replace(/'/g, "%27");
        return newStr;
    }

    projectCompressor.decodeString = function (str) {
        var newStr = str;
        newStr = newStr.replace(/%27/g, "'");
        newStr = decodeURI(str);
        return newStr;
    }

    return projectCompressor;

})();