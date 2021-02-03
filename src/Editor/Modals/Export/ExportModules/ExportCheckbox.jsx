import React from 'react';
import ExportModule from './ExportModule';
import WickInput from 'Editor/Util/WickInput/WickInput';

import 'Editor/styles/Modals/Export/_exportcheckbox.css';

export default function ExportCheckbox (props) {

  return (
    <ExportModule>
      <div className="export-checkbox-container">
        <span className="export-checkbox-text">
          {props.text}
        </span>
        <WickInput
          containerClassName="export-check-container"
          className="export-checkbox"
          onChange={props.onChange}
          type="checkbox"
          checked={props.checked}
        />
      </div>
    </ExportModule>
  )
} 