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
import nightImageShort from 'resources/interface-images/blue_night_short.svg';

var classNames = require('classnames');

class WelcomeModal extends Component {
  constructor () {
    super();
    this.version = "1.17";
    this.forumPost = "https://forum.wickeditor.com/t/wick-editor-1-16-prerelease-3-new-color-picker-builtin-assets-and-more/2105/9";
    this.updates = [
      "Animation Types for Clips",
      "Downloadable Editor",
      "PNG Sequence Export",
    ] // No More than 3

    let t1 = ["Hyun's Dojo", "Guy de Bree", "Dimp"]
    let t2 = ["Constance Ye", "Victoria Rojas"]
    let t3 = ["Gautaum Bose", "Ji Heon Han"]
    let t4 = ["Golan Levin", "ThisPodcastIsInEnglish", "Anonymous"]
    this.patreonSupporters = t1.concat(t2, t3, t4)
  }

  // Render updates as a list.
  renderUpdates = (className) => {
    return  (
      <ul className={classNames("updates-list", className)}>
        {this.updates.map((update,i) => {
          return (<li key={"update-" + i}>{update}</li>);
        })}
      </ul>
    );
  }

  // Render a list of all Patreon supporters.
  renderPatreonSupporters = (className) => {
    return  (
      <div className={classNames("supporter-list-container", className)}>
        <a className="welcome-modal-highlight" target="_blank" rel="noopener noreferrer" href="https://www.patreon.com/WickEditor">Patreon Supporters</a>
        <div className="supporter-list">
          {this.patreonSupporters.join(", ")}
        </div>
      </div>
    );
  }

  renderMobileModal = (modalProps) => {
    return (
      <Modal
        {...modalProps}
        className="modal-body welcome-modal-mobile-body">
          <div className="welcome-modal-mobile-image-container">
            <img className="welcome-modal-mobile-image" alt="Night sky with mountains, clouds, a moon and stars" src={nightImageShort}/>
          </div>
          <div className="welcome-modal-mobile-content">
            <div className="welcome-modal-title small-modal">The Wick Editor</div>
            <div className="welcome-modal-version small-modal"><a className="welcome-modal-highlight" target="_blank" rel="noopener noreferrer" href={this.forumPost}>Version {this.version}</a></div>
            {this.renderUpdates("small-modal")}
            {this.renderPatreonSupporters()}
          </div>
          <div id="welcome-modal-mobile-accept">
              <ActionButton
                className="welcome-modal-button"
                color='green'
                action={this.props.toggle}
                text="Try it"
              />
            </div>
      </Modal>
    );
  }

  renderDesktopModal = (modalProps) => {
    return (
      <Modal
      {...modalProps}
      className="modal-body welcome-modal-body">

        <div id="welcome-modal-interior-content">
          <div id="welcome-image-container" className="welcome-modal-main-container">
            <img id="welcome-image" alt="Night sky with mountains, clouds, a moon and stars" src={nightImage} />
          </div>
          <div id="welcome-message-container" className="modal-main-container">
            <div id="welcome-modal-title" className="welcome-modal-item">Welcome to the Wick Editor!</div>
            <div id="welcome-modal-version" className="welcome-modal-item"><a className="welcome-modal-highlight" target="_blank" rel="noopener noreferrer" href={this.forumPost}>Version {this.version}</a></div>
            <div id="welcome-modal-subtitle" className="welcome-modal-item">Wick Editor {this.version} includes:</div>
            <div id="welcome-modal-message" className="welcome-modal-item">
              {this.renderUpdates()}
              {this.renderPatreonSupporters("desktop-modal")}
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
    )
  }

  render() {
    let modalProps = {
      isOpen: this.props.open,
      toggle: this.props.toggle,
      onRequestClose: this.props.toggle,
      overlayClassName: "modal-overlay welcome-modal-overlay",
    };

    if (window.innerWidth < 800) {
      return this.renderMobileModal(modalProps);
    } else {
      return this.renderDesktopModal(modalProps);
    }
  }

}

export default WelcomeModal
