import React, { useState, useEffect, useRef } from 'react';
import WickModal from '../WickModal/WickModal';
import ExportChoice from './ExportModules/ExportChoice';
import ExportFooter from './ExportModules/ExportFooter';
import ExportNameInput from './ExportModules/ExportNameInput';
import ExportQuality from './ExportModules/ExportQuality';
import ExportSize from './ExportModules/ExportSize';
import WickInput from 'Editor/Util/WickInput/WickInput';
import ExportCheckbox from './ExportModules/ExportCheckbox';

export default function ExportAnimation (props) {
  const [projectName, setProjectName] = useState('')
  const [exportType, setExportType] = useState({name: "GIF"});
  const [videoQuality, setVideoQuality] = useState(7);
  const [size, setSize] = useState({width: props.project.width, height: props.project.height})
  const [showAdvanced, setShowAdvanced] = useState(false);

  let videoOptions = [
    {
      name: "GIF",
      icon: "gif"
    }, 
    {
      name: "MP4",
      icon: "animation"
    }
  ]

  useEffect(() => {
    setProjectName(props.project.name);
  }, [props.project.name]);


  function finalizeExport () {
    let args = {
      name: projectName,
      width: size.width,
      height: size.height,
      quality: videoQuality,
    }

    if (exportType.name === "GIF") {
      props.exportProjectAsGif(args);
    } else if (exportType.name === "MP4") {
      props.exportProjectAsVideo(args);
    }
  }

  return (
    <WickModal
      open={props.open}
      toggle={props.toggle}
      className="export-animation export-modal"
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
          <ExportChoice
            title="Choose Export Type"
            options={videoOptions}
            onChange={setExportType}
            selected={exportType}
          />

          <ExportCheckbox 
          checked={showAdvanced}
          onChange={() => setShowAdvanced(!showAdvanced)}
          text="Show Advanced Options"/>

          {showAdvanced && <ExportQuality
            title="Image Quality"
            value={videoQuality}
            onChange={setVideoQuality} 
            min={0}
            max={10}
            step={1} />}

          {showAdvanced && <ExportSize
            originalWidth={props.project.width}
            originalHeight={props.project.height}
            size={size}
            onChange={setSize} /> }

          <ExportFooter 
            exportAction={finalizeExport}
            openModal={props.openModal}
          />
        </div>
    </WickModal>
  )
}