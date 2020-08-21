import React, { useState } from 'react';

import WickModal from '../WickModal/WickModal';
import ActionButton from '../../Util/ActionButton/ActionButton';

import './_savedprojects.scss';
import SavedProjectItem from './SavedProjectItem/SavedProjectItem';
let classNames = require('classnames');

export default function SavedProjects(props) {
  // Use an empty list if saved files are not provided.
  const projects = props.localSavedFiles ? props.localSavedFiles : []

  const [selectedProject, setSelectedProject] = useState(null);

  let openSelectedFile = () => {
    props.loadLocalWickFile(selectedProject);
    props.toggle();
  }

  let deleteSelectedFile = () => {
    props.deleteLocalWickFile(selectedProject);
    props.reloadSavedWickFiles();
  }

  let attemptOpenFile = () => {
    if (props.openWarningModal) {
      props.openWarningModal({
        title: "Lose Unsaved",
        description: "Any unsaved work will be lost.",
        acceptAction: openSelectedFile,
        cancelAction: () => {},
        acceptText: "Open",
        canceltText: "Cancel"
      });
    }
  }

  let attemptDeleteFile = () => {
    if (props.openWarningModal) {
      props.openWarningModal({
        title: `Delete ${selectedProject.name}`,
        description: "This cannot be undone!",
        acceptAction: deleteSelectedFile,
        cancelAction: () => {},
        acceptText: "Delete",
        canceltText: "Cancel"
      });
    }
  }

  return (
    <WickModal
      open={props.open}
      toggle={props.toggle}
      className={classNames("saved-projects-modal-container", props.isMobile && "mobile")}
      overlayClassName="settings-modal-overlay">

      <h3 className="saved-projects-modal-title">
        Saved Projects
      </h3>
      <div className="saved-projects-modal-body">
        {
          projects.map(project => <SavedProjectItem 
              onClick={() => setSelectedProject(project)}
              selected={selectedProject && selectedProject.name === project.name}
              item={project} />)
        }

        {
          (projects.length === 0) && "No Saved Files"
        }
      </div>
      <div className="saved-projects-modal-footer">
        <ActionButton
          className="saved-projects-modal-button"
          disabled={selectedProject === null}
          color={selectedProject ? 'red' : 'gray'}
          action={attemptDeleteFile}
          text="Delete"
        />
        <ActionButton
          className="saved-projects-modal-button"
          disabled={selectedProject === null}
          color={selectedProject ? 'green' : 'gray'}
          action={attemptOpenFile}
          text="Open"
        />
      </div>
    </WickModal>
  )
}