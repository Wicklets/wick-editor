import React from 'react';

import '../../../styles/Modals/Export/_exportmodule.css';

let classNames = require('classnames');

export default function ExportModule (props) {
    return (
      <div className="we-export-module">
        {props.title &&<div className="we-export-title">
            {props.title}
        </div>}
        {props.children}
      </div>
    )
  }