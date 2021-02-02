import React, { useState, useEffect, useRef } from 'react';
import WickModal from '../WickModal/WickModal';
import ExportChoice from './ExportModules/ExportChoice';
import ExportFooter from './ExportModules/ExportFooter';
import ExportNameInput from './ExportModules/ExportNameInput';

export default function ExportInteractive (props) {
  const [projectName, setProjectName] = useState('')
  const [exportType, setExportType] = useState({name: "MP3"});

  let interactiveOptions = [
    {
      name: "MP3",
      icon: "sound"
    },
  ]

  useEffect(() => {
    setProjectName(props.project.name);
  }, [props.project.name]);


  function finalizeExport () {
    let args = {
      name: projectName,
    }

    props.exportProjectAsAudioTrack(args);
    props.toggle();
  }

  return (
    <WickModal
      open={props.open}
      toggle={props.toggle}
      className="export-interactive export-modal"
      overlayClassName="export-overlay">  
        <div className="we-modal-title">
          Export Audio
        </div>
        <div className="we-modal-subtitle">
          Export a single audio track
        </div>
        <div className="we-modal-content">
          <ExportNameInput 
            onChange={setProjectName}
            value={projectName}
          />
          <ExportChoice
            title="Export Type"
            options={interactiveOptions}
            onChange={setExportType}
            selected={exportType}
          />

          <ExportFooter 
            exportAction={finalizeExport}
            openModal={props.openModal}
          />
        </div>
    </WickModal>
  )
}