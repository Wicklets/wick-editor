import { NativeTypes } from 'react-dnd-html5-backend';

export default {
  GET_ASSET_TYPE: (props) => {
    if (props.asset) return props.asset.classname;
    return 'Asset'
  },
  CANVAS: ['ImageAsset', 'ButtonAsset', 'ClipAsset', 'SVGAsset', NativeTypes.FILE], // TODO: Should take in all ids that canvas can receive.
  TIMELINE: ['SoundAsset'], // TODO: Should take in all ids that timeline can receive.
  GET_OUTLINER_SOURCE: (props) => {
    if (props.data.classname.toLowerCase() === 'frame') {
      return 'frame';
    }
    else if (props.data.classname.toLowerCase() === 'layer') {
      return 'layer';
    }
    else {
      return 'object';
    }
  },
  GET_OUTLINER_TARGETS: (props) => {
    if (props.data.classname.toLowerCase() === 'frame') {
      return ['object'];
    }
    else if (props.data.classname.toLowerCase() === 'layer') {
      return ['object', 'layer'];
    }
    else {
      return ['object'];
    }
  }
}
