import React, { useState, useEffect } from 'react';
import WickModal from '../WickModal/WickModal';
import ExportChoice from './ExportModules/ExportChoice';
import ExportNameInput from './ExportModules/ExportNameInput';
import ExportQuality from './ExportModules/ExportQuality';

export default function ExportAnimation (props) {
  const [projectName, setProjectName] = useState('')
  const [exportType, setExportType] = useState({name: "GIF"});
  const [videoQuality, setVideoQuality] = useState(7);

  let videoOptions = [
    {
      name: "GIF",
      icon: "gif"
    }, 
    {
      name: "Video",
      icon: "animation"
    }
  ]

  useEffect(() => {
    setProjectName(props.project.name);
  }, [props.project.name]);

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
          <ExportQuality
            title="Image Quality"
            value={videoQuality}
            onChange={setVideoQuality} 
            min={1}
            max={10}
            step={1} />
        </div>
    </WickModal>
  )
}
