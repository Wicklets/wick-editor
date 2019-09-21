import React, { Component } from 'react';
import Popover from 'react-popover';

import WickInput from 'Editor/Util/WickInput/WickInput';
import ToolIcon from 'Editor/Util/ToolIcon/ToolIcon';

import './_settingsnumericslider.scss';

class SettingsNumericSlider extends Component {
  constructor(props) {
    super(props);

    this.sliderTimeout = null;

    this.state = {
        sliderOn: false,
    }
  }

  renderIcon = () => {
    let tooltipID = 'settings-input-id-'+this.props.icon;
    return (
      <div
        data-tip
        data-for={tooltipID}
        className='settings-input-icon'
        onClick={this.setSlider(!this.state.sliderOn)}>
        <ToolIcon name={this.props.icon} />
        {this.renderTooltip(tooltipID)}
      </div>);
  }

  /**
   * @param {bool} val True will turn the slider on, false will turn the slider off.
   */
  setSlider(val) {
      clearTimeout(this.sliderTimeout);
      this.setState({
          sliderOn : val,
      });
  }

  closeSlider = () => {
      clearTimeout(this.sliderTimeout);
      this.sliderTimeout = setTimeout(() => {
          this.setSlider(false)
      }, 400);
  }

  /**
   * Returns the react node which contains the wick slider.
   */
  getSliderNode = () => {
      return (
        <WickInput
        type="slider"
        containerclassname="settings-slider-wick-input-container"
        className="settings-numeric-slider"
        onChange={this.props.onChange}
        value={this.props.value}
        {...this.props.inputRestrictions} />
      );
  }

  render () {
      return (
          <div
          className="settings-numeric-slider-container"
          onMouseOver = {() => this.setSlider(true)}
          onMouseLeave = {this.closeSlider}>
            <Popover
            isOpen={this.state.sliderOn}
            preferPlace='below'
            enterExitTransitionDurationMs={200}
            refreshIntervalMs={100}
            body={this.getSliderNode()}
            tipSize={5}>
                <div className="settings-numeric-top-container">
                    <div className="settings-numeric-slider-icon">
                        <ToolIcon name={this.props.icon}/>
                    </div>
                        <WickInput
                            type="numeric"
                            containerclassname="settings-numeric-wick-input-container"
                            className="settings-numeric-input"
                            onChange={this.props.onChange}
                            onFocus={() => {this.setSlider(true)}}
                            onBlur={() => {this.setSlider(false)}}
                            value={this.props.value}
                            {...this.props.inputRestrictions}/>
                </div>
            </Popover>
          </div>
      );
  }
}

export default SettingsNumericSlider
