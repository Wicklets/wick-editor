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
import 'bootstrap/dist/css/bootstrap.min.css';
import WickModal from 'Editor/Modals/WickModal/WickModal';
import ActionButton from 'Editor/Util/ActionButton/ActionButton';

import './_editorinfo.scss';
import ToolIcon from '../../Util/ToolIcon/ToolIcon';

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
                    <div className="editor-info-name">Wick Editor</div>
                    <div className="editor-info-version">Version {this.props.editorVersion}</div>
                    <a className="editor-info-link" href="https://www.wickeditor.com/#/terms-and-conditions" target="_blank" rel="noopener noreferrer">Terms and Conditions</a>
                    <br/>
                    <a className="editor-info-link" href="https://www.wickeditor.com/#/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                    <br/>
                    <a className="editor-info-link" href="https://www.wickeditor.com/#/cookie-policy" target="_blank" rel="noopener noreferrer">Cookie Policy</a>
                    <br/>
                    <a className="editor-info-link" href="https://forum.wickeditor.com" target="_blank" rel="noopener noreferrer">Community Forum</a>
                    <br/>
                    <div className="editor-info-open-source-notices">
                        <ActionButton
                            color="gray"
                            text="Open Source Notices"
                            action={() => {this.props.openModal("OpenSourceNotices")}} />
                    </div>
                </div> 
            </WickModal>
        );
    }
}
export default WelcomeModal