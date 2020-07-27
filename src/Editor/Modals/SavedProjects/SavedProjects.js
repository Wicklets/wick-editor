import React from 'react';

import WickModal from '../WickModal/WickModal';
import ActionButton from '../../Util/ActionButton/ActionButton';

let classNames = require('classnames');

export default function SavedProjects() {
  return (
    <WickModal
      open={this.props.open}
      toggle={this.props.toggle}
      className={classNames("saved-projects-modal-container", this.props.isMobile && "mobile")}
      overlayClassName="settings-modal-overlay">

      <div className="saved-projects-modal-title">
        Saved Projects
            </div>
      <div className="saved-projects-modal-body">
        {
          window.saveFilesToDisplay ?
            "Saved Files" :
            "No Saved Files"
        }
      </div>
      <div className="saved-projects-modal-footer">
        <ActionButton
          className="project-settings-modal-button"
          color='red'
          action={() => console.log("Deleting")}
          text="Delete"
        />
        <ActionButton
          className="project-settings-modal-button"
          color='green'
          action={() => console.log("Opening")}
          text="Open"
        />
      </div>
    </WickModal>
  )
}