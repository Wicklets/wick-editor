import React, { useState } from 'react';
import WickModal from '../WickModal/WickModal';
import ExportChoice from './ExportModules/ExportChoice';
import ExportFooter from './ExportModules/ExportFooter';
import ExportCheckbox from './ExportModules/ExportCheckbox';
import ExportSize from './ExportModules/ExportSize';

export default function ExportInteractive (props) {
  const [exportType, setExportType] = useState({name: "PNG"});
  const [size, setSize] = useState({width: props.project.width, height: props.project.height})
  const [showAdvanced, setShowAdvanced] = useState(false);

  let imageOptions = [
    {
      name: "PNG",
      icon: "image"
    },
    {
      name: "SVG",
      icon: "svg"
    }
  ]


  function finalizeExport () {
    let args = {
      width: size.width,
      height: size.height
    }

    if (exportType.name === "PNG") {
      props.exportProjectAsImageSequence(args);
    } else if (exportType.name === "SVG") {
      props.exportProjectAsImageSVG(args);
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
          Export Image Sequence
        </div>
        <div className="we-modal-subtitle">
          Export project as a set of images
        </div>
        <div className="we-modal-content">
          <ExportChoice
            title="Choose Export Type"
            options={imageOptions}
            onChange={setExportType}
            selected={exportType}
          />

          <ExportCheckbox 
            checked={showAdvanced}
            onChange={() => setShowAdvanced(!showAdvanced)}
            text="Show Advanced Options"/>

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