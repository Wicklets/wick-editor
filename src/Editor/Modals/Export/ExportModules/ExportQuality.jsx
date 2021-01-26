import React from 'react';
import ExportModule from './ExportModule';
import Slider from '@material-ui/core/Slider';

import '../../../styles/Modals/Export/_exportquality.css';

export default function ExportQuality (props) {

  let min = props.min || 1;
  let max = props.max || 10;

  let marks = [
    {
      value: min,
      label: "Low"
    },
    {
      value: Math.round(max/2),
      label: "Medium"
    },
    {
      value: max,
      label: "High"
    }
  ]

  function onChange (event, newValue) {
    props.onChange(newValue);
  }

  return (
    <ExportModule
      title={props.title}>
      <div className="export-quality-container">
        <Slider 
          min={props.min || 1}
          max={props.max || 10}
          step={props.step || 1}
          onChange={onChange}
          marks={marks}
          value={props.value}
          valueLabelDisplay="auto"/>
      </div>
    </ExportModule>
  )
}