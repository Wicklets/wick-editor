/*
 * Copyright 2020 WICKLETS LLC
 *
 * This file is part of Wick Editor.
 *
 * Wick Editor is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Wick Editor is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Wick Editor.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { Component } from 'react';
import ActionButton from 'Editor/Util/ActionButton/ActionButton';
import WickModal from 'Editor/Modals/WickModal/WickModal';
import WickInput from 'Editor/Util/WickInput/WickInput';
import ObjectInfo from '../../Util/ObjectInfo/ObjectInfo';
import TabbedInterface from 'Editor/Util/TabbedInterface/TabbedInterface';

import './_exportoptions.scss';

let classNames=require("classnames");

class ExportOptions extends Component {
  constructor (props) {
    super(props);
    this.placeholderName = 'Filename';
    this.state = {
      name: this.props.projectName || '',
      subTab: 'Animation',
      exportWidth: 1920,
      exportHeight: 1080,
      exportResolution: "1080p",
      blackBars: true,
      useAdvanced: false,
    }

    this.customSizeTag = "custom";

    // If size is not represented, default to "custom".
    this.advancedSizes = {
      "1080p": {
        width: 1920,
        height: 1080,
      },
      "720p": {
        width: 1080,
        height: 720,
      },
      "480p": {
        width: 720,
        height: 480
      }
    }
  }

  resetCustomSize = () => {
    this.setState({
      exportResolution: this.customSizeTag,
      exportWidth: 720,
      exportHeight: 405,
    });
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.projectName !== this.props.projectName) {
      this.setState({
          name: this.props.projectName,
        });
    }
  }

  /**
   * Creates an item of type and toggles the modal.
   * @param {string} type Either 'GIF', 'VIDEO', 'ZIP', or 'HTML'.
   */
  createAndToggle = (type) => {
    let name = this.state.name !== "" ? this.state.name : (type);

    let args = {
      name: name,
      width:  this.state.useAdvanced ? this.state.exportWidth : undefined,
      height: this.state.useAdvanced ? this.state.exportHeight : undefined,
    }

    if (type === 'GIF') {
      this.props.exportProjectAsGif(args);
    } else if (type === 'VIDEO') {
      this.props.exportProjectAsVideo(args);
    } else if (type === 'ZIP') {
      this.props.exportProjectAsStandaloneZip(args);
      this.props.toggle();
    } else if (type === 'HTML') {
      this.props.exportProjectAsStandaloneHTML(args);
      this.props.toggle();
    } else if (type === 'IMAGE_SEQUENCE') {
      this.props.exportProjectAsImageSequence(args);
    } else if (type === 'AUDIO_TRACK') {
      this.props.exportProjectAsAudioTrack(args);
      this.props.toggle();
    } else if (type === 'IMAGE_SVG') {
      this.props.exportProjectAsImageSVG(name);
      this.props.toggle();
      
    }
  }

  // Updates the clip name in the state.
  updateExportName = (newName) => {
    this.setState({
      name: newName,
    });
  }

  setSubTab = (name) => {
    this.setState({
      subTab: name,
    });
  }

  toggleAdvancedOptionsCheckbox = () => {
    this.setState({
      useAdvanced: !this.state.useAdvanced,
    })
  }

  updateExportSize = (width, height) => {

    let res = this.customSizeTag;

    Object.keys(this.advancedSizes).forEach(key => {
      let size = this.advancedSizes[key];
      if (size.width === width && size.height === height) {
        res = key;
      }
    });

    this.setState({
      exportResolution: res,
      exportWidth: width,
      exportHeight: height,
    });
  }

  updateExportResolutionType = (val) => {
    let value = val.value;

    if (value === this.customSizeTag) {
      this.resetCustomSize();
    } else if (this.advancedSizes[value]) {
      let dimensions = this.advancedSizes[value];
      this.setState({
        exportResolution: value,
        exportWidth: dimensions.width,
        exportHeight: dimensions.height,
      });
    }
  }

  renderAdvancedOptions = () => {
    let optionsValues = Object.keys(this.advancedSizes).concat([this.customSizeTag]);
    let options = optionsValues.map((val) => {return {label: val, value: val}});

    return (
      <div className="export-modal-advanced-options">
        <div className="export-modal-advanced-checkbox-container">
          <WickInput
            type="checkbox"
            checked={this.state.useAdvanced}
            onChange={this.toggleAdvancedOptionsCheckbox}
            label="Resolution Options"/>
        </div>
        {this.state.useAdvanced &&
          <div className="export-modal-advanced-options-content">

          {/* label is this because overwriting default library react-select */}


          <table>
            <tbody className="advanced-resolution-table">
              <tr>
                <td>
                  <label htmlFor="advanced-resolution-dropdown" className="export-modal-advanced-option-title">
                    Export Resolution
                  </label>
                </td>
                <td>

                </td>
                <td>

                </td>
              </tr>

              <tr>
                <td>
                </td>
                <td>
                  <label htmlFor="export-width" className="export-modal-resolution-label">
                    Width (px)
                  </label>
                </td>
                <td>
                  <label htmlFor="export-height" className="export-modal-resolution-label">
                    Height (px)
                  </label>
                </td>
              </tr>

              <tr>
                <td>
                <WickInput
                  id="advanced-resolution-dropdown"
                  inputProps={{id: "resolution"}}
                  type="select"
                  value={this.state.exportResolution}
                  options={options}
                  onChange={(val) => {this.updateExportResolutionType(val)}} />
                </td>
                <td>
                  <WickInput
                  id="export-width"
                  type="numeric"
                  value={this.state.exportWidth}
                  onChange={(val) => {this.updateExportSize(val, this.state.exportHeight)}}
                  />
                </td>
                <td>
                <WickInput
                  id="export-height"
                  type="numeric"
                  value={this.state.exportHeight}
                  onChange={(val) => {this.updateExportSize(this.state.exportWidth, val)}}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        }
      </div>
    )
  }

  renderGifObject = () => {
    return (
      <div className={classNames("export-info-item", this.props.isMobile && "mobile")}>
        <ObjectInfo
          className="export-object-info"
          title="Animated GIF"
          rows={[
            { text: "Creates a .gif file", icon: "check" },
            { text: "No Sound",            icon: "cancel" },
            { text: "Not Interactive",      icon: "cancel" },
          ]} />
        <div className="export-modal-button-container">
          <ActionButton
            color='gray-green'
            action={() => { this.createAndToggle("GIF") }}
            text="Export GIF"
            />
        </div>
      </div>
    )
  }

  renderVideoObject = () => {
    return (
      <div className={classNames("export-info-item", this.props.isMobile && "mobile")}>
        <ObjectInfo
          className="export-object-info"
          title="Video (Beta)"
          rows={[
            { text: "Creates an .mp4 file", icon: "check" },
            { text: "Has Sound",            icon: "check" },
            { text: "Not Interactive",       icon: "cancel"},
          ]}/>
        <div className="export-modal-button-container">
          <ActionButton
            color='gray-green'
            action={() => { this.createAndToggle("VIDEO") }}
            text="Export Video (Beta)"
            />
        </div>
      </div>
    )
  }

  renderStandaloneVideoObject = (componentFn) => {
    return (
      <div>
        {componentFn()}
        {this.renderAdvancedOptions()}
      </div>
    )
  }

  // Renders the body of the "Animation" tab.
  renderAnimatedInfo = () => {
    return (
      <div>
        <div className={classNames("export-info-container", this.props.isMobile && "mobile")}>
          {this.renderGifObject()}
          {this.renderVideoObject()}
        </div>
        {this.renderAdvancedOptions()}
      </div>

    );
  }

  // Renders the body of the "Interactive" tab.
  renderInteractiveInfo = () => {
    return (
      <div className="export-info-container">
        <div className="export-info-item">
          <ObjectInfo
            className="export-object-info"
            title="ZIP Archive"
            rows={[
              { text: "Fully Interactive",    icon: "check" },
              { text: "Works on other sites", icon: "check" },
              { text: "Exports a .zip file",  icon: "check" }
            ]}>
          </ObjectInfo>
          <div className="export-modal-button-container">
            <ActionButton
            color='gray-green'
            action={() => { this.createAndToggle("ZIP") }}
            text="Export ZIP"
            />
          </div>
        </div>
        <div className="export-info-item">
          <ObjectInfo
            className="export-object-info"
            title="HTML"
            rows={[
              { text: "1-Click open",           icon: "check" },
              { text: "Easily share projects",  icon: "check" },
              { text: "Exports a .html file",   icon: "check" }
            ]}>
          </ObjectInfo>
          <div className="export-modal-button-container">
            <ActionButton
              color='gray-green'
              action={() => { this.createAndToggle("HTML") }}
              text="Export HTML"
            />
          </div>
        </div>
      </div>
    );
  }

    // Renders the body of the "Animation" tab.
    renderImageInfo = () => {
      return (
        <div>
          <div className={classNames("export-info-container", this.props.isMobile && "mobile")}>
            <div className={classNames("export-info-item", this.props.isMobile && "mobile")}>
              <ObjectInfo
                className="export-object-info"
                title="Image Sequence"
                rows={[
                  {
                    text: "Creates a .zip archive",
                    icon: "check"
                  },
                  {
                    text: "Exports .png files",
                    icon: "check",
                  },
                  {
                    text: "Not interactive",
                    icon: "cancel"
                  },
                ]} />
              <div className="export-modal-button-container">
              <ActionButton
                color='gray-green'
                action={() => { this.createAndToggle('IMAGE_SEQUENCE') }}
                text="Export Image Sequence"
                />
              </div>
            </div>
            <div className={classNames("export-info-item", this.props.isMobile && "mobile")}>
              <ObjectInfo
                className="export-object-info"
                title="Image SVG"
                rows={[
                  {
                    text: "Creates a .svg file",
                    icon: "check"
                  },
                  {
                    text: "Not Animated",
                    icon: "cancel",
                  },
                  {
                    text: "Not ineractive",
                    icon: "cancel"
                  },
                ]} />
              <div className="export-modal-button-container">
              <ActionButton
                color='gray-green'
                action={() => { this.createAndToggle('IMAGE_SVG') }}
                text="Export Image SVG"
                />
              </div>
            </div>
          </div>
          {this.renderAdvancedOptions()}
        </div>
      );
    }

  renderAudioInfo () {
    return (
      <div className="export-info-container">
        <div className="wide-export-info-item">
          <ObjectInfo
            className="export-object-info"
            title="Audio"
            rows={[
              {
                text: "Creates a .wav file of all audio in the project",
                icon: "check"
              },
              {
                text: "Not Interactive",
                icon: "cancel"
              },
            ]} />
          <div className="export-modal-button-container">
          <ActionButton
            color='gray-green'
            action={() => { this.createAndToggle('AUDIO_TRACK') }}
            text="Export Audio"
            />
          </div>
        </div>
      </div>
    );
  }

  renderDesktop = () => {
    window.allowedExportTypes = window.allowedExportTypes.sort((a, b) => {
      let order = ["Animation", "Interactive", "Audio", "Images"];

      return order.indexOf[a] - order.indexOf[b]; 
    });

    let allowedExportTypes = window.allowedExportTypes.concat([]);

    return (
      <WickModal
      open={this.props.open}
      toggle={this.props.toggle}
      className={classNames("export-modal-body")}
      overlayClassName="export-modal-overlay">
        <div id="export-modal-interior-content">
          <div id="export-modal-title">Export</div>
          <div id="export-modal-name-input">
            <WickInput
              type="text"
              value={this.state.name}
              onChange={this.updateExportName}
              placeholder={this.placeholderName}
              aria-label="project name" />
          </div>
          <TabbedInterface
            tabNames={allowedExportTypes}
            onTabSelect={this.setSubTab}>
              { allowedExportTypes.indexOf('Animation') > -1 && this.renderAnimatedInfo()}
              { allowedExportTypes.indexOf('Interactive') > -1 && this.renderInteractiveInfo()}
              { allowedExportTypes.indexOf('Audio') > -1 && this.renderAudioInfo()}
              { allowedExportTypes.indexOf('Images') > -1 && this.renderImageInfo()}
          </TabbedInterface>
        </div>
      </WickModal>
    );
  }

  renderMobile = () => {
    return (
      <WickModal
      open={this.props.open}
      toggle={this.props.toggle}
      className={classNames("export-modal-body", {"advanced-options": (this.state.useAdvanced && (this.state.subTab === "Animation" || this.state.subTab === "Images"))}, "mobile")}
      overlayClassName={classNames("export-modal-overlay", "mobile")}>
        <div id="export-modal-interior-content">
          <div id="export-modal-title">Export</div>
          <div id="export-modal-name-input">
            <WickInput
              type="text"
              value={this.state.name}
              onChange={this.updateExportName}
              placeholder={this.placeholderName}
              aria-label="project name" />
          </div>
          <TabbedInterface
            tabNames={["GIF", "Video"]}
            onTabSelect={this.setSubTab}>
            {this.renderStandaloneVideoObject(this.renderGifObject)}
            {this.renderStandaloneVideoObject(this.renderVideoObject)}
          </TabbedInterface>
        </div>
      </WickModal>
    );
  }

  render() {
    if (this.props.isMobile) {
      return this.renderMobile();
    }
    else {
      return this.renderDesktop();
    }
  }
}

export default ExportOptions
