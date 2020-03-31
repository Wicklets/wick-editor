/*
 * Copyright 2028 WICKLETS LLC
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
import WickModal from 'Editor/Modals/WickModal/WickModal';
import TabbedInterface from 'Editor/Util/TabbedInterface/TabbedInterface';
import ProjectSettings from './ProjectSettings/ProjectSettings';
import KeyboardShortcuts from './KeyboardShortcuts/KeyboardShortcuts';

import './_settingsmodal.scss';


class SettingsModal extends Component {
  renderProjectSettings = () => {
    return (
      <ProjectSettings
        project={this.props.project}
        updateProjectSettings={this.props.updateProjectSettings} />
    );
  }

  renderShortcuts = () => {
    return (
      <KeyboardShortcuts
        addCustomHotKeys={this.props.addCustomHotKeys}
        resetCustomHotKeys={this.props.resetCustomHotKeys}
        customHotKeys={this.props.customHotKeys}
        keyMap={this.props.keyMap} />
    )
  }

  render() {
    return (
      <WickModal
      open={this.props.open} 
      toggle={this.props.toggle}
      className="settings-modal-container"
      overlayClassName="settings-modal-overlay">
        <div className="settings-modal-title">
          Settings
        </div>
        <div className="settings-modal-body">
          <TabbedInterface tabNames={["Project", "Shortcuts"]} >
            <ProjectSettings
              project={this.props.project}
              updateProjectSettings={this.props.updateProjectSettings}
              colorPickerType={this.props.colorPickerType}
              changeColorPickerType={this.props.changeColorPickerType}
              updateLastColors={this.props.updateLastColors}
              lastColorsUsed={this.props.lastColorsUsed}/>
            <KeyboardShortcuts
              addCustomHotKeys={this.props.addCustomHotKeys}
              resetCustomHotKeys={this.props.resetCustomHotKeys}
              customHotKeys={this.props.customHotKeys}
              keyMap={this.props.keyMap}
              keyMapGroups={this.props.keyMapGroups}
              toast={this.props.toast} 
              createCombinedHotKeyMap={this.props.createCombinedHotKeyMap}/>
          </TabbedInterface>
        </div>
      </WickModal>
    );
  }
}

export default SettingsModal
