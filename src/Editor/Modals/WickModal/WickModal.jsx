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
import Modal from 'react-modal';
import ToolIcon from 'Editor/Util/ToolIcon/ToolIcon';

import './_wickmodal.scss';

var classNames = require('classnames');

class WickModal extends Component {
  renderIcon () {
    return (
      <div id="modal-icon-container">
        <ToolIcon name={this.props.icon} /> 
      </div> 
    );
  }

  render() {
    return (
      <Modal 
      isOpen={this.props.open} 
      toggle={this.props.toggle} 
      onRequestClose={this.props.toggle}
      className={classNames("modal-body", this.props.className)}
      overlayClassName={classNames("modal-overlay", this.props.overlayClassName)}>
      <div id="modal-close-icon-container" onClick={this.props.toggle}>
        <ToolIcon name="closemodal" /> 
      </div>
      <div className="modal-generic-container">
        {this.props.icon && this.renderIcon()}    
        {this.props.children}
      </div>
      </Modal>
    );
  }
}

export default WickModal