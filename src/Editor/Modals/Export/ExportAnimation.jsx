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
  useTraceUpdate(props);

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

  function exportAnimation () {
    const details = {
      name: projectName,
      type: exportType.name,
      quality: videoQuality,
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
            exportAction={exportAnimation}
            openModal={props.openModal}
          />
        </div>
    </WickModal>
  )
}

function useTraceUpdate(props) {
  const prev = useRef(props);
  useEffect(() => {
    const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
      if (prev.current[k] !== v) {
        ps[k] = [prev.current[k], v];
      }
      return ps;
    }, {});
    if (Object.keys(changedProps).length > 0) {
      console.log('Changed props:', changedProps);
    }
    prev.current = props;
  });
}