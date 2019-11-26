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
import ActionButton from 'Editor/Util/ActionButton/ActionButton';

import './_builtinlibrary.scss';

import nightImage from 'resources/interface-images/blue_night.svg';

class BuiltinLibrary extends Component {
  get builtinAssets () {
    return [
      {
        file: 'wickobjects/vcam.wickobj',
        name: 'Vcam',
      },
      {
        file: 'sounds/jason-derulo.mp3',
        name: 'Jason Derulo',
      },
      {
        file: 'sounds/jason-derulo.mp3',
        name: 'Jason Derulo',
      },
      {
        file: 'sounds/jason-derulo.mp3',
        name: 'Jason Derulo',
      },
      {
        file: 'sounds/jason-derulo.mp3',
        name: 'Jason Derulo',
      },
      {
        file: 'sounds/jason-derulo.mp3',
        name: 'Jason Derulo',
      },
      {
        file: 'sounds/jason-derulo.mp3',
        name: 'Jason Derulo',
      },
      {
        file: 'sounds/jason-derulo.mp3',
        name: 'Jason Derulo',
      },
      {
        file: 'sounds/jason-derulo.mp3',
        name: 'Jason Derulo',
      },
    ]
  }

  importAsset = (assetPath, assetName) => {
    var path = process.env.PUBLIC_URL + '/builtinlibrary/' + assetPath;
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
        <div class='builtin-library-asset-grid'>
          {
            this.builtinAssets.map(asset => {
              return this.renderBuiltinAsset(asset)
            })
          }
        </div>
      </Modal>
    );
  }

  renderBuiltinAsset = (asset) => {
    return (
      <div
        class='builtin-library-asset'
        onClick={(() => this.importAsset(asset.file, asset.name))}>
        {asset.name}
      </div>
    );
  }
}

export default BuiltinLibrary
