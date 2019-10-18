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

import './_welcomemessage.scss';

import nightImage from 'resources/interface-images/blue_night.svg';

class WelcomeModal extends Component {
  getVersion() {
    return "1.15"
  }

  render() {
    return (
      <Modal
      isOpen={this.props.open}
      toggle={this.props.toggle}
      onRequestClose={this.props.toggle}
      className="modal-body welcome-modal-body"
      overlayClassName="modal-overlay welcome-modal-overlay">
        <div id="welcome-modal-interior-content">
          <div id="welcome-image-container" className="welcome-modal-main-container">
            <img id="welcome-image" alt="welcome to wick editor" src={nightImage} />
          </div>
          <div id="welcome-message-container" className="modal-main-container">
            <div id="welcome-modal-title" className="welcome-modal-item">Welcome to the Wick Editor!</div>
            <div id="welcome-modal-version" className="welcome-modal-item">Version {this.getVersion()}</div>
            <div id="welcome-modal-subtitle" className="welcome-modal-item">Wick Editor {this.getVersion()} includes:</div>
            <div id="welcome-modal-message" className="welcome-modal-item">
              <ul>
                <li>New <a className="welcome-modal-highlight welcome-link" target="_blank" href="https://www.patreon.com/WickEditor">Patreon</a> rewards!</li>
                <li>Faster brush</li>
                <li>Faster timeline</li>
                <li>New timeline interactions</li>
                <li>Customizable hotkeys system</li>
                <li>New project settings window</li>
                <li><a className="welcome-modal-highlight welcome-link" target="_blank" rel="noopener noreferrer" href="https://forum.wickeditor.com/t/wick-editor-1-15-customizable-hotkeys-faster-brush-new-timeline-discord-patreon-rewards-and-more/2010">...and more!</a></li>
              </ul>
            </div>
            <div id="welcome-modal-tutorial-links" className="welcom-modal-item">
              <a className="welcome-modal-highlight welcome-link" target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/watch?v=pAsrXT8KIrI">Animation Tutorial</a>
              <a className="welcome-modal-highlight welcome-link" target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/watch?v=cvANBF43KsY">Interactive Tutorial</a>
            </div>
            <div id="welcome-modal-forum-link" className="welcome-modal-item">Please report all bugs on our <a className="welcome-modal-highlight" target="_blank" rel="noopener noreferrer" href="https://forum.wickeditor.com">forum!</a></div>
            <div id="welcome-modal-footer">
              <div id="welcome-modal-accept">
                <ActionButton
                  className="welcome-modal-button"
                  color='green'
                  action={this.props.toggle}
                  text="Try it"
                  />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

export default WelcomeModal
