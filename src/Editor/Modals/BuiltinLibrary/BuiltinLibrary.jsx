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

import wickobjects from './wickobjects.js'
import sounds from './sounds.js'

import './_builtinlibrary.scss';

class BuiltinLibrary extends Component {
  static get ROOT_ASSET_PATH () {
    return process.env.PUBLIC_URL + '/builtinlibrary/';
  }

  importAsset = (assetPath, assetName) => {
    var path = BuiltinLibrary.ROOT_ASSET_PATH + assetPath;

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
            Builtin Library (Beta)
          </div>
          <TabbedInterface tabNames={["Clips", "Sounds"]} >
            {this.renderAssetGroup(wickobjects.name, wickobjects.assets)}
            {this.renderAssetGroup(sounds.name, sounds.assets)}
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
            return this.renderBuiltinAsset(asset);
          })
        }
      </div>
    )
  }

  renderBuiltinAsset = (asset) => {
    function _MIMETypeOfString(string) {
      return string.split(':')[1].split(',')[0].split(';')[0];
    }

    return (
      <div
        key={"builtin-asset-" + asset.name}
        className='builtin-library-asset'>
        <div className='builtin-library-asset-name'>
          {asset.name}
        </div>
        {asset.icon === 'icons/sound.png' && asset.src &&
        <audio controls style={{width: "100%"}}>
          <source src={asset.src} type={asset.MIMEType}/>
        </audio>
        }
        {asset.icon === 'icons/sound.png' && !asset.src &&
        <ActionButton
          className="preview-sound-button"
          textClassName="preview-sound-button-text"
          action={() => {
            var path = BuiltinLibrary.ROOT_ASSET_PATH + asset.file;

            fetch (path)
            .then((response) => response.blob())
            .then((blob) => {
              blob.lastModifiedDate = new Date();
              blob.name = asset.file.split('/').pop();
              
              let reader = new FileReader();

              reader.onload = () => {
                let dataURL = reader.result;
                asset.src = dataURL;
                asset.MIMEType = _MIMETypeOfString(dataURL);

                this.setState({});
              }

              reader.readAsDataURL(blob);
            })
            .catch((error) => {
              console.error("Error while importing builtin asset (" + asset.name + "," + asset.file + "): ")
              console.log(error);
            });
          }}
          color="sky"
          text="Preview Sound"/>
        }
        {asset.icon !== 'icons/sound.png' &&
        <button
          className='builtin-library-asset-icon-container'
          onClick={(() => this.importAsset(asset.file, asset.name))}>
          <img
            alt='Builtin Asset Icon'
            src={BuiltinLibrary.ROOT_ASSET_PATH + asset.icon}
            className='builtin-library-asset-icon'/>
        </button>
        }
        <ActionButton
          className="add-as-asset-button"
          action={() => {
            // TODO: If it's preloaded by preview, shouldn't import again
            this.importAsset(asset.file, asset.name);
          }}
          text="Add as Asset"
        />
      </div>
    );
  }
}

export default BuiltinLibrary
