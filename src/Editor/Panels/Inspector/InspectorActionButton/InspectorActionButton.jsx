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
import './_inspectoractionbutton.scss';
import ActionButton from 'Editor/Util/ActionButton/ActionButton';

class InspectorActionButton extends Component {
  render() {
    let action = this.props.action;

    if (action === undefined) return (<div />)

    let btnID = action.id === undefined ? 'tooltip-nyi' : action.id;
    let actionColor = action.color ? action.color : "inspector";

    return(
      <div className="inspector-button">
        <ActionButton
          color={actionColor}
          icon={action.icon}
          id={"inspector-button-" + btnID}
          action={action.action}
          text={action.tooltip}/>
      </div>

    )
  }
}

export default InspectorActionButton
