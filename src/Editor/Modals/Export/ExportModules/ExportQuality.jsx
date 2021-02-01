import React from 'react';
import ExportModule from './ExportModule';
import Slider from '@material-ui/core/Slider';

import '../../../styles/Modals/Export/_exportquality.css';

export default function ExportQuality (props) {

  let min = props.min === undefined ? 1 : props.min;
  let max = props.max === undefined ? 10 : props.max;

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
          min={min}
          max={max}
          step={props.step || 1}
          onChange={onChange}
          marks={marks}
          value={props.value}
          valueLabelDisplay="auto"/>
      </div>
    </ExportModule>
  )
}