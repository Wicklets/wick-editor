import React from 'react';

import '../../styles/Modals/Export/_exportmodule.css';

export default function ExportModule (props) {
    return (
      <div className="we-export-module">
        <div className="we-export-title">
            {props.title}
        </div>
        {props.children}
    </div>
    )
  }