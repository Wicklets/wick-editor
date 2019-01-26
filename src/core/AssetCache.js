class AssetCache {
  constructor (editor) {
    this.editor = editor;

    this._cache = [];
  }

  getCachedDataForAsset (asset) {
    let uuid = asset.uuid;
    return this._cache.find(cacheEntry => {
      return cacheEntry.uuid === uuid;
    });
  }

  setCachedDataForAsset (asset) {
    if(this.getCachedDataForAsset(asset)) return;

    this._cache.push({
      src: asset.src,
      html5Image: asset.html5Image,
      paperjsRaster: asset.paperjsRaster,
    });
  }
}

export default AssetCache;
