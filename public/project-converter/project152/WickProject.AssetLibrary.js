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
    
var AssetLibrary = function () {

    this.assets = {};

};

AssetLibrary.prototype.addAsset = function (asset) {

    if(asset.uuid) {
        this.assets[asset.uuid] = asset;
    } else {
        var uuid = random.uuid4();
        this.assets[uuid] = asset;
        asset.uuid = uuid;

        return uuid;
    }
}

AssetLibrary.prototype.deleteAsset = function (uuid) {

    this.assets[uuid] = null;
    delete this.assets[uuid];

}

AssetLibrary.prototype.getAsset = function (uuid) {

    return this.assets[uuid];

}

AssetLibrary.prototype.getAllAssets = function (type) {

    var allAssets = [];

    for (assetUUID in this.assets) {
        var asset = this.assets[assetUUID];
        if(!type || asset.type === type) {
            allAssets.push(asset);
        }
    }

    return allAssets;

}

AssetLibrary.prototype.getAssetByName = function (filename) {

    var foundAsset = null;
    this.getAllAssets().forEach(function (asset) {
        if (asset.filename === filename)
            foundAsset = asset;
    });
    return foundAsset

}

/* For backwards compatibility... */
AssetLibrary.prototype.regenAssetUUIDs = function () {

    for (assetUUID in this.assets) {
        var asset = this.assets[assetUUID];
        asset.uuid = assetUUID;
    }

}

AssetLibrary.prototype.printInfo = function () {

    var totalSize = 0;
    for (assetUUID in this.assets) {
        var asset = this.assets[assetUUID];
        totalSize += asset.data.length;

        console.log("Filename: "+asset.filename);
        console.log("Type: "+asset.type);
        console.log("Size: "+asset.data.length);
        console.log("---")
    }
    console.log("Total library size: " + totalSize)

}

AssetLibrary.prototype.encodeStrings = function () {
    this.getAllAssets().forEach(function (asset) {
        asset.filename = WickProject.Compressor.encodeString(asset.filename);
        asset.data = WickProject.Compressor.encodeString(asset.data);
    });
}

AssetLibrary.prototype.decodeStrings = function () {
    this.getAllAssets().forEach(function (asset) {
        asset.filename = WickProject.Compressor.decodeString(asset.filename);
        asset.data = WickProject.Compressor.decodeString(asset.data);
    });
}

AssetLibrary.addPrototypes = function (library) {

    for (assetUUID in library.assets) {
        library.assets[assetUUID].__proto__ = WickAsset.prototype;
    }

}
