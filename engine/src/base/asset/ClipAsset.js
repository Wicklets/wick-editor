/*
 * Copyright 2019 WICKLETS LLC
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

Wick.ClipAsset = class extends Wick.Asset {
    /**
     * Creates a new Clip Asset.
     * @param {Wick.Clip} clip - the clip to link this asset to
     */
    constructor (args) {
        if(!args) args = {};

        args.identifier = args.clip ? args.clip.identifier : null;
        super(args);

        this.clipType = null;
        this.linkedClips = [];

        if(args.clip) this.useClipAsSource(args.clip);
    }

    deserialize (data) {
        super.deserialize(data);
        this._timeline = data.timeline;
    }

    serialize (args) {
        var data = super.serialize(args);
        data.timeline = this._timeline;
        return data;
    }

    get classname () {
        return 'ClipAsset';
    }

    /**
     * The timeline that this asset is linked to.
     */
    get timeline () {
        return Wick.ObjectCache.getObjectByUUID(this._timeline);
    }

    /**
     * Uses the timeline of the given clip as the data for this asset.
     * @param {Wick.Clip} clip - the clip to use as the source
     */
    useClipAsSource (clip) {
        this.identifier = clip.identifier;
        this.clipType = clip.classname;
        this.timeline = clip.timeline.clone(false);
    }

    /**
     * Creates a new Clip using the source of this asset.
     */
    createInstance () {
        var clip = new Wick[this.clipType]();
        this.useAsSourceForClip(clip);
        return clip;
    }

    /**
     * Sets a given clip to use the source of this asset for its timeline data.
     * Note: This will replace the timeline of the clip with the asset's timeline.
     * @param {Wick.Clip} clip - the clip to change the timeline data of
     */
    useAsSourceForClip (clip) {
        this.linkedClips.push(clip);
        this.updateClipFromAsset(clip);
    }

    /**
     * Unlink a given clip from this asset. The clip's timeline will no longer be synced with this asset.
     * @param {Wick.Clip} clip - The clip to unlink from this asset.
     */
    removeAsSourceForClip (clip) {
        this.linkedClips = this.linkedClips.filter(checkClip => {
            return checkClip !== clip;
        });
    }

    /**
     * Take the timeline data from a clip and use it to update this asset.
     * This will also update the timelines of all instances of this asset.
     * @param {Wick.Clip} clip - The clip to use the timeline of to update this asset.
     */
    updateAssetFromClip (clip) {
        this.timeline = clip.timeline.clone(false);

        var self = this;
        this.linkedClips.forEach(linkedClip => {
            if(linkedClip === clip) return; // This one should already be synced, of course
            this.updateClipFromAsset(linkedClip);
        });
    }

    /**
     * Replace the timeline of the clip with the asset's timeline.
     * @param {Wick.Clip} clip - the clip to change the timeline data of
     */
    updateClipFromAsset (clip) {
        var timeline = this.timeline.clone(false);
        clip.timeline = timeline;
    }

    /**
     * Removes all instances of this asset from the project.
     */
    removeAllInstances () {
        this.linkedClips.forEach(clip => {
            clip.remove();
        });
    }
}
