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

import React, { useState } from 'react';
import { Popover } from 'reactstrap';
import WickColorPicker  from 'Editor/Util/ColorPicker/WickColorPicker';

import './_colorpicker.scss';

export default function ColorPicker (props) {
  const [open, setOpen] = useState(false);

  let color = props.color ? props.color : new window.Wick.Color("#FFFFFF")
  let itemID = props.id;
  let popoverID = itemID+'-popover';

  function toggle () {
    if (!open) {
      setTimeout(selectPopover, 200);
    }

    setOpen(!open)
  }

  function selectPopover () {
    let ele = document.getElementById(popoverID);
    if (ele) {
      ele.focus();
    }
  }

  return (
      <button
        className={"btn-color-picker"}
        aria-label="color picker button"
        id={itemID}
        onClick={toggle}
        style={props.stroke ? {borderColor: color} : {backgroundColor: color}}
        >
          <Popover
            tabIndex={-1}
            id={popoverID}
            placement={props.placement}
            isOpen={open}
            toggle={toggle}
            target={itemID}
            boundariesElement={'viewport'}>
            <WickColorPicker
              toggle={toggle}
              colorPickerType={props.colorPickerType}
              changeColorPickerType={props.changeColorPickerType}
              disableAlpha={props.disableAlpha}
              color={color}
              onChangeComplete={props.onChangeComplete}
              lastColorsUsed={props.lastColorsUsed}
            />
          </Popover>
      </button>
  )
}
