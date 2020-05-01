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
import './_menubariconbutton.scss';
import ActionButton from 'Editor/Util/ActionButton/ActionButton';

class MenuBarIconButton extends Component {
  render() {
    return(
      <div className="menu-bar-icon-button">
        <ActionButton
          color="menu"
          id={this.props.id}
          tooltip={this.props.tooltip}
          action={this.props.action}
          icon={this.props.icon}
          tooltipPlace="bottom">
        </ActionButton>
      </div>
    )
  }
}

export default MenuBarIconButton
