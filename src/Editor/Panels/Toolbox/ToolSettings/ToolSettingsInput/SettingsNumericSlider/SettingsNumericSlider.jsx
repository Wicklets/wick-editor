import React, { Component } from 'react';
import Popover from 'react-popover';
import ReactTooltip from 'react-tooltip';

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
      /*TODO Move the tooltip to somewhere more generic*/

      // Detect if on mobile to disable tooltips.
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

      return (
        <div
        className="settings-numeric-slider-container">
          <Popover
          isOpen={this.state.sliderOn}
          preferPlace='below'
          enterExitTransitionDurationMs={200}
          refreshIntervalMs={100}
          body={this.getSliderNode()}
          tipSize={5}>
              <div className="settings-numeric-top-container">
                {/*TODO Move the tooltip to somewhere more generic*/}
                <div
                  className="settings-numeric-slider-icon"
                  data-tip
                  data-for={'setting-' + this.props.name}
                  id={'setting-' + this.props.name}>
                  <ToolIcon name={this.props.icon}/>
                    <ReactTooltip
                      disable={isMobile}
                      id={'setting-' + this.props.name}
                      type='info'
                      place={'bottom'}
                      effect='solid'
                      aria-haspopup='true'
                      className="wick-tooltip">
                      <span>{this.props.name}</span>
                    </ReactTooltip>
                </div>
                <div
                  onMouseOver = {() => this.setSlider(true)}
                  onMouseLeave = {this.closeSlider}>
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
            </div>
          </Popover>
        </div>
      );
  }
}

export default SettingsNumericSlider
