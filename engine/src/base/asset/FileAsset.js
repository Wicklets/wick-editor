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

Wick.FileAsset = class extends Wick.Asset {
    /**
     * Returns all valid MIME types for files which can be converted to Wick Assets.
     * @return {string[]} Array of strings of MIME types in the form MediaType/Subtype.
     */
    static getValidMIMETypes() {
        let imageTypes = Wick.ImageAsset.getValidMIMETypes();
        let soundTypes = Wick.SoundAsset.getValidMIMETypes();
        let fontTypes = Wick.FontAsset.getValidMIMETypes();
        let clipTypes = Wick.ClipAsset.getValidMIMETypes();
        let svgTypes = Wick.SVGAsset.getValidMIMETypes();
        let gifTypes = Wick.GIFAsset.getValidMIMETypes();
        return imageTypes.concat(soundTypes).concat(fontTypes).concat(clipTypes).concat(svgTypes).concat(gifTypes);
    }

    /**
     * Returns all valid extensions types for files which can be attempted to be
     * converted to Wick Assets.
     * @return  {string[]} Array of strings representing extensions.
     */
    static getValidExtensions() {
        let imageExtensions = Wick.ImageAsset.getValidExtensions();
        let soundExtensions = Wick.SoundAsset.getValidExtensions();
        let fontExtensions = Wick.FontAsset.getValidExtensions();
        let clipExtensions = Wick.ClipAsset.getValidExtensions();
        let svgExtensions = Wick.SVGAsset.getValidExtensions();
        let gifExtensions = Wick.GIFAsset.getValidExtensions();
        return imageExtensions
            .concat(soundExtensions)
            .concat(fontExtensions)
            .concat(clipExtensions)
            .concat(svgExtensions)
            .concat(gifExtensions);
    }

    /**
     * Create a new FileAsset.
     * @param {string} filename - the filename of the file being used as this asset's source.
     * @param {string} src - a base64 string containing the source for this asset.
     */
    constructor(args) {
        if (!args) args = {};
        args.name = args.filename;
        super(args);

        this.fileExtension = null
        this.MIMEType = null;

        this.filename = args.filename;
        this.src = args.src;
    }

    _serialize(args) {
        var data = super._serialize(args);

        data.filename = this.filename;
        data.MIMEType = this.MIMEType;
        data.fileExtension = this.fileExtension;

        if (args && args.includeOriginalSource) {
            data.originalSource = this.src;
        }

        return data;
    }

    _deserialize(data) {
        super._deserialize(data);

        this.filename = data.filename;
        this.MIMEType = data.MIMEType;
        this.fileExtension = data.fileExtension;

        if (data.originalSource) {
            this.src = data.originalSource;
        }
    }

    get classname() {
        return 'FileAsset';
    }

    /**
     * The source of the data of the asset, in base64. Returns null if the file is not found.
     * @type {string}
     */
    get src() {
        let file = Wick.FileCache.getFile(this.uuid);
        if (file) return file.src;
        return null;
    }

    set src(src) {
        if (src) {
            Wick.FileCache.addFile(src, this.uuid);
            this.fileExtension = this._fileExtensionOfString(src);
            this.MIMEType = this._MIMETypeOfString(src);
        }
    }

    /**
     * Loads data about the file into the asset.
     */
    load(callback) {
        callback();
    }

    /**
     * Copies the FileAsset and also copies the src in FileCache.
     * @return {Wick.FileAsset}
     */
    copy() {
        var copy = super.copy();
        copy.src = this.src;
        return copy;
    }

    _MIMETypeOfString(string) {
        return string.split(':')[1].split(',')[0].split(';')[0];
    }

    _fileExtensionOfString(string) {
        var MIMEType = this._MIMETypeOfString(string);
        return MIMEType && MIMEType.split('/')[1];
    }
}
