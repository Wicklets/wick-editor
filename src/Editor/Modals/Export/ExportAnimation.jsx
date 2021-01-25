import React, { useState, useEffect } from 'react';
import WickModal from '../WickModal/WickModal';
import ExportNameInput from './ExportNameInput';

export default function ExportAnimation (props) {
  const [projectName, setProjectName] = useState('')

  useEffect(() => {
    setProjectName(props.project.name);
  }, [props.project.name])

  return (
    <WickModal
      open={props.open}
      toggle={props.toggle}
      className="export-animation"
      overlayClassName="export-overlay">  
        <div className="we-modal-title">
          Export Animation
        </div>
        <div className="we-modal-subtitle">
          Export a non-interactive video file
        </div>
        <div className="we-modal-content">
          <ExportNameInput 
            onChange={setProjectName}
            value={projectName}
          />
        </div>
    </WickModal>
  )
}
