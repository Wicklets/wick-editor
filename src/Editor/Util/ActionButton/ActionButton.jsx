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

import React from 'react';

import WickInput from 'Editor/Util/WickInput/WickInput';
import ToolIcon from 'Editor/Util/ToolIcon/ToolIcon';

import './_actionbutton.scss';

var classNames = require('classnames');

export default function ActionButton (props) {
  let isActive = props.isActive || (() => false);
  let colorClass = props.color ? "action-button-"+props.color : "action-button-green";
  let finalColorClassName = classNames(colorClass, {'active-button' : isActive()}, props.buttonClassName)
  let tooltipID = props.id ? ('action-button-tooltip-' + props.id) : 'action-button-tooltip-nyi';
  let newClassName = classNames("action-button", props.className);


  function runAction (e) {
    if (!props.disabled) {
      props.useClickEvent ? props.action(e) : props.action();
    }
  }

  function renderSingleIcon () {
    return <ToolIcon className={classNames("action-button-single-icon", props.iconClassName, {"dropdown-action-button-icon": props.dropdown})} 
    name={props.icon} />
  }

  function renderDropdownIcon () {
    return <div className="action-button-dropdown-icon-container">
      <ToolIcon className={classNames(props.iconClassName, {"dropdown-action-button-icon": props.dropdown})} 
      name={props.icon} />
      {props.dropdown && <ToolIcon className="dropdown-extra-icon" name="moreactions"/>}
    </div>
  }

  function renderTextIcon () {
    return <div className="action-button-icon-text-container">
      <ToolIcon className={classNames(props.iconClassName, "action-button-text-icon", {"dropdown-action-button-icon": props.dropdown})} 
      name={props.icon} />
      {props.text && <span className={classNames(newClassName+'-text', props.textClassName)}>{props.text}</span>}
    </div>
  }

  function renderText () {
    return <span className={classNames("action-button-text", newClassName+'-text', props.textClassName)}>{props.text}</span>
  }

  function renderContent () {
    if (props.dropdown && props.icon) {
      return renderDropdownIcon();
    } else if (props.icon && props.text) {
      return renderTextIcon();
    } else if (props.icon) {
      return renderSingleIcon();
    } else if (props.text) {
      return renderText();
    }
  }

  return (
    <div className={newClassName}>
      <WickInput
        buttonProps={props.buttonProps}
        tooltip={props.tooltip}
        tooltipID={tooltipID}
        tooltipPlace={props.tooltipPlace}
        className={finalColorClassName}
        type="button"
        secondaryAction={props.secondaryAction}
        onClick={runAction}
        onTouch={runAction}>
          {renderContent()}
      </WickInput>
    </div>
  );
}