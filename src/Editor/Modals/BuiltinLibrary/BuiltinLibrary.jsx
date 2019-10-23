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
      }
    ]
  }

  importAsset = (assetPath, assetName) => {
    var path = process.env.PUBLIC_URL + '/builtinlibrary/' + assetPath;
    console.log(path);

    fetch (path)
    .then((response) => response.blob())
    .then((data) => {
      alert('todo blob -> file')
      this.props.importFileAsAsset(data, () => {

      });
    })
    .catch((error) => {
      console.error("Error while importing builtin asset (" + assetName + "," + assetPath + "): ")
      console.log(error);
    });
  }

  renderBuiltinAsset = (asset) => {
    return (
      <ActionButton
        className="builtin-library-modal-button"
        color='green'
        action={(() => this.importAsset(asset.file, asset.name))}
        text={asset.name}
      />
    );
  }

  render() {
    return (
      <Modal
      isOpen={this.props.open}
      toggle={this.props.toggle}
      onRequestClose={this.props.toggle}
      className="modal-body welcome-modal-body"
      overlayClassName="modal-overlay welcome-modal-overlay">
        {
          this.builtinAssets.map(asset => {
            return this.renderBuiltinAsset(asset)
          })
        }
      </Modal>
    );
  }
}

export default BuiltinLibrary
