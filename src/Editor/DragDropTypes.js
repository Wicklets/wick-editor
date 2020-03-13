import { NativeTypes } from 'react-dnd-html5-backend';

export default {
  GET_ASSET_TYPE: (props) => {
    if (props.asset) return props.asset.classname;
    return 'Asset'
  },
  CANVAS: ['ImageAsset', 'ButtonAsset', 'ClipAsset', NativeTypes.FILE], // TODO: Should take in all ids that canvas can receive.
  TIMELINE: ['SoundAsset'] // TODO: Should take in all ids that timeline can receive.
}
