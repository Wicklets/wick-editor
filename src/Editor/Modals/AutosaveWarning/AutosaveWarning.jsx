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
import ActionButton from 'Editor/Util/ActionButton/ActionButton';
import WickModal from 'Editor/Modals/WickModal/WickModal';

import './_autosavewarning.scss';

class AutosaveWarning extends Component {
  loadAndToggle = () => {
    this.props.loadAutosavedProject(() => {
      this.props.toggle();
    });
  }

  deleteAndToggle = () => {
    this.props.clearAutoSavedProject(() => {
      this.props.toggle();
    });
  }

  render() {
    return (
      <WickModal
      open={this.props.open}
      toggle={this.props.toggle}
      icon="autosave"
      className="autosave-modal-body"
      overlayClassName="autosave-modal-overlay">
        <div id="autosave-modal-interior-content">
          <div id="autosave-modal-title">Load Autosave?</div>
          <div id="autosave-modal-footer">
            <div id="autosave-modal-cancel">
                <ActionButton
                  className="autosave-modal-button"
                  color='red'
                  action={this.deleteAndToggle}
                  text="Delete"
                  icon="delete-black"
                  iconClassName="autosave-icon"
                  />
              </div>
              <div id="autosave-modal-accept">
                <ActionButton
                  className="autosave-modal-button"
                  color='green'
                  action={this.loadAndToggle}
                  text="Load"
                  icon="load"
                  iconClassName="autosave-icon"
                  />
              </div>
          </div>
        </div>
      </WickModal>
    );
  }
}

export default AutosaveWarning
