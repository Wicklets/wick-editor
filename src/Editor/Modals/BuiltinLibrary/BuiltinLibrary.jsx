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
import Modal from 'react-modal';
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
          file: 'wickobjects/vcam.wickobj',
          name: 'Vcam',
          icon: '',
        },{
          file: 'wickobjects/checkbox.wickobj',
          name: 'Checkbox',
          icon: '',
        },{
          file: 'wickobjects/keyboardcontrol.wickobj',
          name: 'Keyboard Controlled Character',
          icon: '',
        },{
          file: 'wickobjects/link.wickobj',
          name: 'URL Link',
          icon: '',
        },{
          file: 'wickobjects/slider.wickobj',
          name: 'Slider',
          icon: '',
        },{
          file: 'wickobjects/textinput.wickobj',
          name: 'Text Input',
          icon: '',
        }],
      },
      {
        name: 'Sounds',
        assets: [{
          file: 'sounds/jason-derulo.mp3',
          name: 'Jason Derulo',
          icon: 'icons/derulo.jpeg',
        },
        {
          file: 'sounds/jason-derulo.mp3',
          name: 'Jason Derulo',
          icon: 'icons/derulo.jpeg',
        },
        {
          file: 'sounds/jason-derulo.mp3',
          name: 'Jason Derulo',
          icon: 'icons/derulo.jpeg',
        },
        {
          file: 'sounds/jason-derulo.mp3',
          name: 'Jason Derulo',
          icon: 'icons/derulo.jpeg',
        },
        {
          file: 'sounds/jason-derulo.mp3',
          name: 'Jason Derulo',
          icon: 'icons/derulo.jpeg',
        },
        {
          file: 'sounds/jason-derulo.mp3',
          name: 'Jason Derulo',
          icon: 'icons/derulo.jpeg',
        },
        {
          file: 'sounds/jason-derulo.mp3',
          name: 'Jason Derulo',
          icon: 'icons/derulo.jpeg',
        },
        {
          file: 'sounds/jason-derulo.mp3',
          name: 'Jason Derulo',
          icon: 'icons/derulo.jpeg',
        },
        {
          file: 'sounds/jason-derulo.mp3',
          name: 'Jason Derulo',
          icon: 'icons/derulo.jpeg',
        },
        {
          file: 'sounds/jason-derulo.mp3',
          name: 'Jason Derulo',
          icon: 'icons/derulo.jpeg',
        },
        {
          file: 'sounds/jason-derulo.mp3',
          name: 'Jason Derulo',
          icon: 'icons/derulo.jpeg',
        },
        {
          file: 'sounds/jason-derulo.mp3',
          name: 'Jason Derulo',
          icon: 'icons/derulo.jpeg',
        },
        {
          file: 'sounds/jason-derulo.mp3',
          name: 'Jason Derulo',
          icon: 'icons/derulo.jpeg',
        },
        {
          file: 'sounds/jason-derulo.mp3',
          name: 'Jason Derulo',
          icon: 'icons/derulo.jpeg',
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
      <Modal
      isOpen={this.props.open}
      toggle={this.props.toggle}
      onRequestClose={this.props.toggle}
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
      </Modal>
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
        className='builtin-library-asset'
        onClick={(() => this.importAsset(asset.file, asset.name))}>
        <div className='builtin-library-asset-icon-container'>
          <img
            src={BuiltinLibrary.ROOT_ASSET_PATH + asset.icon}
            className='builtin-library-asset-icon'/>
        </div>
        <div className='builtin-library-asset-name'>
          {asset.name}
        </div>
      </div>
    );
  }
}

export default BuiltinLibrary
