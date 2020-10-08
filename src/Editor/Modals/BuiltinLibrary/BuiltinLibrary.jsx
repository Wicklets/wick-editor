/*
 * Copyright 2020 WICKLETS LLC
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
import ActionButton from 'Editor/Util/ActionButton/ActionButton';
import AudioPlayer from 'Editor/Util/AudioPlayer/AudioPlayer';

import wickobjects from './wickobjects.js'
import sounds from './sounds.js'

import './_builtinlibrary.scss';

class BuiltinLibrary extends Component {
  constructor (props) {
    super(props);

    this.toPlay = null;
  }

  static get ROOT_ASSET_PATH () {
    return process.env.PUBLIC_URL + '/builtinlibrary/';
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
            Builtin Library (Beta)
          </div>
          <TabbedInterface tabNames={["Clips", "Sounds"]} >
            <div className="builtin-library-asset-grid">{wickobjects.assets.map(this.renderBuiltinAsset)}</div>
            <div className="builtin-library-asset-grid">{sounds.assets.map(this.renderSoundAsset)}</div>
          </TabbedInterface>
        </div>
      </WickModal>
    );
  }

  //Fetch file, add to builtinPreviews
  importForPreview = (asset, callback) => {
    var path = BuiltinLibrary.ROOT_ASSET_PATH + asset.file;

    fetch (path)
    .then((response) => response.blob())
    .then((blob) => {
        blob.lastModifiedDate = new Date();
        blob.name = asset.file.split('/').pop();

        this.props.addFileToBuiltinPreviews(asset.file, blob);

        callback && callback(blob);
    })
    .catch((error) => {
        console.error("Error while importing builtin asset (" + asset.name + "," + asset.file + "): ")
        console.log(error);
    });
  }

  //Fetch file to builtinPreviews if necessary, then load into Asset Library
  createWickAsset = (asset) => {
    if (!this.props.builtinPreviews[asset.file]) {
      this.importForPreview(asset, (blob) => {
        this.props.importFileAsAsset(blob);
      });
    }
    else {
      this.props.importFileAsAsset(this.props.builtinPreviews[asset.file].blob);
    }
  }

  renderBuiltinAsset = (asset) => {
    return (
      <div key={asset.file} className='builtin-library-asset'>
        <div className='builtin-library-asset-name'> 
          {asset.name} 
        </div>
        
        <div
          className='builtin-library-asset-icon-container'>
            <img
            alt='Builtin Asset Icon'
            src={BuiltinLibrary.ROOT_ASSET_PATH + asset.icon}
            className='builtin-library-asset-icon'
            />
        </div>

        {this.props.isAssetInLibrary(asset.file.split("/").pop()) ?
          <ActionButton
            className="add-as-asset-button"
            action={() => {}}
            text="Already Added"
            color="gray"
          />
        :
          <ActionButton
            className="add-as-asset-button"
            action={() => {
              this.createWickAsset(asset);
            }}
            text="Add as Asset"
          />
        }
      </div>
    );
  }

  renderSoundAsset = (asset) => {
    let src = undefined;

    if (this.props.builtinPreviews[asset.file]) {
      src = this.props.builtinPreviews[asset.file].src;
    }

    return (
      <div key={asset.file} className='builtin-library-asset'>
        <div className='builtin-library-asset-name'>
          {asset.name}
        </div>

        <div className="audio-preview">
        <AudioPlayer 
          key={asset.file}
          src={src}
          loadSrc={() => this.importForPreview(asset, () => {})}
        />
        </div>

        {this.props.isAssetInLibrary(asset.file.split("/").pop()) ?
          <ActionButton
            className="add-as-asset-button"
            action={() => {}}
            text="Already Added"
            color="gray"
          />
        :
          <ActionButton
            className="add-as-asset-button"
            action={() => {
              this.createWickAsset(asset);
            }}
            text="Add as Asset"
          />
        }
      </div>
    );
  }
}

export default BuiltinLibrary
