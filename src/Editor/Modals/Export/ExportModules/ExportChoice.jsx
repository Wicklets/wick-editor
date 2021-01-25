import React from 'react';
import ToolIcon from 'Editor/Util/ToolIcon/ToolIcon';
import ExportModule from './ExportModule';

import '../../../styles/Modals/Export/_exportchoice.css';

let classNames = require('classnames');

export default function ExportChoice (props) {
  return (
    <ExportModule
      title={props.title}>
      <div className="export-choice-container">
        {props.options.map(option => {
          return <ChoiceOption 
            name={option.name}
            icon={option.icon}
            onChange={() => {props.onChange(option)}}
            selected={props.selected}
          />
        })}
      </div>
    </ExportModule>
  )
}

function ChoiceOption (props) {
  return (
    <button 
      className={classNames("choice-option", {"selected": props.selected.name === props.name})}
      onClick={props.onChange}>
      <span className="choice-name">{props.name}</span>
      <span className="choice-icon">
        <ToolIcon name={props.icon} />
      </span>
    </button>
  )
}