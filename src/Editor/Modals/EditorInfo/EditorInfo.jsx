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
import WickModal from 'Editor/Modals/WickModal/WickModal';
import ActionButton from 'Editor/Util/ActionButton/ActionButton';

import './_editorinfo.scss';
import ToolIcon from '../../Util/ToolIcon/ToolIcon';

var classNames = require('classnames');

class WelcomeModal extends Component {
    render () {
        return (
            <WickModal
            open={this.props.open} 
            toggle={this.props.toggle}
            className="editor-info-modal-container"
            overlayClassName="editor-info-modal-overlay">
                <div className="editor-info-modal-body">
                    <div className="editor-info-icon">
                        <ToolIcon name="mascot"/>
                    </div>
                    <div className="editor-info-version">Wick Editor Version 1.0.0</div>
                    <div className="editor-info-link"><a href="www.wickeditor.com/#/terms-and-conditions">Terms and Conditions</a></div>
                    <div className="editor-info-link"><a href="www.wickeditor.com/#/privacy-policy">Privacy Policy</a></div>
                    <div className="editor-info-link"><a href="www.wickeditor.com/#/cookie-policy">Cookie Policy</a></div>
                    <div className="editor-info-link"><a href="forum.wickeditor.com">Community Forum</a></div>
                    <div className="editor-info-open-source-notices">
                        <ActionButton
                            color="menu"
                            text="Open Source Notices"
                            action={() => {this.props.openModal("openSourceNoticesModal")}} />
                    </div>
                </div> 
            </WickModal>
        );
    }
}
export default WelcomeModal