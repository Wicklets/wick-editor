/*
 * Copyright 2018 WICKLETS LLC
 *
 * This file is part of Wick Editor.
 *
 * Wick Editor is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Wick Editor is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Wick Editor.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import WickModal from 'Editor/Modals/WickModal/WickModal';
import TabbedInterface from 'Editor/Util/TabbedInterface/TabbedInterface';

import './_builtinlibrary.scss';

class BuiltinLibrary extends Component {
  static get ROOT_ASSET_PATH () {
    return process.env.PUBLIC_URL + '/builtinlibrary/';
  }

  get builtinAssets () {
    return [
      {
        name: 'Clips',
        assets: [{
          file: 'wickobjects/button.wickobj',
          name: 'Button',
          icon: 'icons/button.png',
          type: 'wickobject',
        },{
          file: 'wickobjects/vcam.wickobj',
          name: 'Vcam',
          icon: 'icons/vcam.png',
          type: 'wickobject',
        },{
          file: 'wickobjects/checkbox.wickobj',
          name: 'Checkbox',
          icon: 'icons/checkbox.png',
          type: 'wickobject',
        },{
          file: 'wickobjects/keyboardcontrol.wickobj',
          name: 'Keyboard Controlled Character',
          icon: 'icons/keyboardcharacter.png',
          type: 'wickobject',
        },{
          file: 'wickobjects/link.wickobj',
          name: 'URL Link',
          icon: 'icons/link.png',
          type: 'wickobject',
        },{
          file: 'wickobjects/slider.wickobj',
          name: 'Slider',
          icon: 'icons/slider.png',
          type: 'wickobject',
        },{
          file: 'wickobjects/textinput.wickobj',
          name: 'Text Input',
          icon: 'icons/textinput.png',
          type: 'wickobject',
        }],
      },
      {
        name: 'Sounds',
        assets: [{
          file: 'sounds/bite1.ogg',
          name: 'Bite 1',
          icon: 'icons/sound.png',
          type: 'sound',
        },{
          file: 'sounds/bloop1.ogg',
          name: 'Bloop 1',
          icon: 'icons/sound.png',
          type: 'sound',
        },{
          file: 'sounds/bloop2.ogg',
          name: 'Bloop 2',
          icon: 'icons/sound.png',
          type: 'sound',
        }]
      },
    ]
  }

  importAsset = (assetPath, assetName) => {
    var path = BuiltinLibrary.ROOT_ASSET_PATH + assetPath;
    console.log(path);

    fetch (path)
    .then((response) => response.blob())
    .then((blob) => {
      blob.lastModifiedDate = new Date();
      blob.name = assetPath.split('/').pop();
      this.props.importFileAsAsset(blob, () => {

      });
    })
    .catch((error) => {
      console.error("Error while importing builtin asset (" + assetName + "," + assetPath + "): ")
      console.log(error);
    });
  }

  render() {
    return (
      <WickModal
      open={this.props.open}
      toggle={this.props.toggle}
      className="modal-body welcome-modal-body"
      overlayClassName="modal-overlay welcome-modal-overlay">
        <div className='builtin-library'>
          <div className="builtin-library-modal-title">
            Builtin Library
          </div>
          <TabbedInterface tabNames={["Clips", "Sounds"]} >
            {this.builtinAssets.map(assetGroup => {
              return this.renderAssetGroup(assetGroup.name, assetGroup.assets)
            })}
          </TabbedInterface>
        </div>
      </WickModal>
    );
  }

  renderAssetGroup (name, assets) {
    return (
      <div className='builtin-library-asset-grid'>
        {
          assets.map(asset => {
            return this.renderBuiltinAsset(asset)
          })
        }
      </div>
    )
  }

  renderBuiltinAsset = (asset) => {
    return (
      <div
        className='builtin-library-asset'>
        <div
          className='builtin-library-asset-icon-container'
          onClick={(() => this.importAsset(asset.file, asset.name))}>
          <img
            alt='Builtin Asset Icon'
            src={BuiltinLibrary.ROOT_ASSET_PATH + asset.icon}
            className='builtin-library-asset-icon'/>
        </div>
        <div className='builtin-library-asset-name'>
          {asset.name}
        </div>
      </div>
    );

    /*{asset.type === 'sound' &&
      <div className='builtin-library-asset-sound-preview'>
        <audio ref="audio_tag" src={BuiltinLibrary.ROOT_ASSET_PATH + asset.file} controls autoPlay/>
      </div>
    }*/
  }
}

export default BuiltinLibrary
