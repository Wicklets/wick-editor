import React from 'react';
import ExportModule from './ExportModule';
import WickInput from 'Editor/Util/WickInput/WickInput';

import '../../../styles/Modals/Export/_exportnameinput.css';

export default function ExportNameInput (props) {
  return (
    <ExportModule title="Export Name">
      <WickInput 
        type="text"
        className="export-text-input"
        onChange={props.onChange}
        placeholder="my project"
        value={props.value}
      /> 
    </ExportModule>
  )
}