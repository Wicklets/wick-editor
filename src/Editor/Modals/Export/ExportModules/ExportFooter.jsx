import React from 'react';
import 'Editor/styles/Modals/Export/_exportfooter.css';

export default function ExportFooter (props) {
  return (
    <div className="export-footer">
      <button 
        onClick={() => props.openModal('ChooseExport')}
        className="export-button export-back">
        Back
      </button>
      <button 
        onClick={props.exportAction}
        className="export-button export-complete">
        Export
      </button>
    </div>
  )
}