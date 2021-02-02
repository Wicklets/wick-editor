import React from 'react';
import WickModal from 'Editor/Modals/WickModal/WickModal';
import 'Editor/styles/Modals/_chooseexport.css';
import ToolIcon from 'Editor/Util/ToolIcon/ToolIcon';

let classNames = require('classnames');


export default function ChooseExport (props) {
    
    return (
        <WickModal
        open={props.open}
        toggle={props.toggle}
        className={classNames("choose-export")}
        overlayClassName={classNames("choose-export-overlay")}>
            <div className="we-modal-title">
                Export Options
            </div>
            <div className="we-modal-subtitle">
                Choose an Export Method
            </div>
            <div className="choose-export-content">
                <div className="choose-export-column">
                    <ExportButton 
                        text="Animation" 
                        icon="animation"
                        onClick={() => {props.openModal('ExportAnimation')}} />
                    <ExportButton 
                        text="Audio" 
                        icon="audio"
                        onClick={() => {props.openModal('ExportAudio')}}/>
                </div>
                <div className="choose-export-column">
                    <ExportButton 
                        text="Interactive" 
                        icon="interactive"
                        onClick={() => {props.openModal('ExportInteractive')}}
                        />
                    <ExportButton text="Images" icon="image"/>
                </div>
            </div>
        </WickModal>
    )
}

function ExportButton (props) {
    return (
        <button 
            className="choose-export-button"
            onClick={props.onClick}>
            <div className="choose-export-button-text">{props.text}</div>
            <div className="choose-export-button-icon-container">
                <ToolIcon name={props.icon} />
            </div>
        </button>
    )
}