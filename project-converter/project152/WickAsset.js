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

var WickAsset = function (data, type, filename, compress) {

    this.data = data;
    this.type = type;
    this.filename = filename;
    this.compressed = compress;

    if(compress) {
        console.log("big file size: " + this.data.length);
        this.data = LZString.compressToBase64(this.data);
        console.log("compressed file size: " + this.data.length);
        console.log("Look how much space we saved wow!");
    }

}

WickAsset.prototype.getData = function () {
    if(this.compressed) {
        return LZString.decompressFromBase64(this.data);
    } else {
        return this.data;
    }
}

WickAsset.prototype.getType = function () {
    return this.type;
}

WickAsset.prototype.getFilename = function () {
    return this.filename;
}
