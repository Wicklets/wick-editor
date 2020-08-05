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
import Modal from 'react-modal';
import ActionButton from 'Editor/Util/ActionButton/ActionButton';

import './_mobilemenu.scss';

class MobileMenu extends Component {
  render() {
    let modalProps = {
      isOpen: this.props.open,
      toggle: this.props.toggle,
      onRequestClose: this.props.toggle,
      overlayClassName: "modal-overlay mobile-menu-overlay",
    };

    let items = [{text: "new", icon: "create-white", action: this.props.openNewProjectConfirmation},
        {text: "open", icon: "load-white", action: this.props.openProjectFileDialog},
        {text: "export", icon: "export", action: () => this.props.openModal('ExportOptions')},
        {text: "settings", icon: "gear-white", action: () => this.props.openModal('SettingsModal')},
        {text: "about", icon: "mascotmarkwhite", action: () => this.props.openModal('EditorInfo')}];

    return (
        <Modal
        {...modalProps}
        className="mobile-menu-mobile-body">
            <div className="mobile-menu-options-container">
                {items.map(({text, icon, action}) => 
                <ActionButton key={text} className="mobile-menu-option" buttonClassName="no-bg mobile-menu-button" iconClassName="mobile-menu-icon" action={action} text={text} icon={icon}/>)}
            </div>
            <div className="mobile-menu-close">
                <ActionButton icon="cancel-white" iconClassName="mobile-menu-close-icon" buttonClassName="no-bg" action={this.props.toggle} color="gray"/>
            </div>
        </Modal>
      );
  }

}

export default MobileMenu
