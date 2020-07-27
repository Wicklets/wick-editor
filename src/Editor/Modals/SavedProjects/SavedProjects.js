import React, { useState } from 'react';

import WickModal from '../WickModal/WickModal';
import ActionButton from '../../Util/ActionButton/ActionButton';

import './_savedprojects.scss';
import SavedProjectItem from './SavedProjectItem/SavedProjectItem';
let classNames = require('classnames');

export default function SavedProjects(props) {
  const dummyProjects = [
    {
      name: "Project 1",
      date: new Date().getUTCDate(),
      size: "66kb",
    },
    {
      name: "Project 2",
      date: new Date().getDate(),
      size: "89kb",
    },
    {
      name: "Project 3",
      date: new Date().getDate(),
      size: "459kb",
    },
    {
      name: "Project 4",
      date: new Date().getDate(),
      size: "1.23mb",
    },
  ]

  const [selectedProject, setSelectedProject] = useState(null);

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
          dummyProjects ?
            dummyProjects.map(project => <SavedProjectItem 
              onClick={() => setSelectedProject(project)}
              selected={selectedProject && selectedProject.name === project.name}
              item={project} />):
            "No Saved Files"
        }
      </div>
      <div className="saved-projects-modal-footer">
        <ActionButton
          className="saved-projects-modal-button"
          color='red'
          action={() => console.log("Deleting")}
          text="Delete"
        />
        <ActionButton
          className="saved-projects-modal-button"
          color={selectedProject ? 'green' : 'gray'}
          action={() => console.log("Opening")}
          text="Open"
        />
      </div>
    </WickModal>
  )
}