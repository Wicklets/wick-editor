import React, { useState } from 'react';
import Popover from 'react-popover'

import WickInput from 'Editor/Util/WickInput/WickInput';
import ToolIcon from 'Editor/Util/ToolIcon/ToolIcon';

import 'Editor/styles/Panels/Toolbox/settingsnumericslider.css';

const classNames = require('classnames');

export default function SettingsNumericSlider (props) {

  const [sliderOn, setSliderOn] = useState(false);
  
  return (
    <div className="settings-numeric-slider">
      <ToolIcon 
        name={props.icon} 
        className={classNames("settings-numeric-slider-icon", {mobile: props.isMobile})}/>

      <Popover
        isOpen={sliderOn}
        preferPlace='below'
        body={<div className="settings-numeric-slider-container">
              <WickInput
                type="slider"
                containerclassname="settings-slider-wick-input-container"
                className="settings-numeric-slider"
                onChange={props.onChange}
                value={props.value}
                {...props.inputRestrictions} />
        </div>}
        onOuterAction={() => {setSliderOn(false)}}
        refreshIntervalMs={200}
        enterExitTransitionDurationMs={100}
        appendTarget={document.getElementById('editor')}
        >
        <WickInput
          type="numeric"
          className={classNames("settings-numeric-input", {"mobile": props.isMobile})}
          onChange={props.onChange}
          onFocus={() => {setSliderOn(true)}}
          onBlur={() => {setSliderOn(false)}}
          onClick={() => {setSliderOn(true)}}
          value={props.value}
          {...props.inputRestrictions}
        />
      </Popover>
    </div>
  )
}
