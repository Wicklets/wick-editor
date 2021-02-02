import React, { useState, useEffect, useRef } from 'react';
import WickModal from '../WickModal/WickModal';
import ExportChoice from './ExportModules/ExportChoice';
import ExportFooter from './ExportModules/ExportFooter';
import ExportNameInput from './ExportModules/ExportNameInput';

export default function ExportInteractive (props) {
  const [projectName, setProjectName] = useState('')
  const [exportType, setExportType] = useState({name: "HTML"});

  let interactiveOptions = [
    {
      name: "HTML",
      icon: "html"
    },
    {
      name: "ZIP",
      icon: "zip"
    }
  ]

  useEffect(() => {
    setProjectName(props.project.name);
  }, [props.project.name]);


  function finalizeExport () {
    let args = {
      name: projectName,
    }

    if (exportType.name === "ZIP") {
      props.exportProjectAsStandaloneZip(args);
    } else if (exportType.name === "HTML") {
      props.exportProjectAsStandaloneHTML(args);
    }

    props.toggle && props.toggle();
  }

  return (
    <WickModal
      open={props.open}
      toggle={props.toggle}
      className="export-interactive export-modal"
      overlayClassName="export-overlay">  
        <div className="we-modal-title">
          Export Interactive
        </div>
        <div className="we-modal-subtitle">
          Export an interactive project
        </div>
        <div className="we-modal-content">
          <ExportNameInput 
            onChange={setProjectName}
            value={projectName}
          />
          <ExportChoice
            title="Choose Export Type"
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