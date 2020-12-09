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

import React, { Component, Fragment } from 'react';
import './_mobileinspector.scss';
import '../../Inspector/_inspectorselector.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import MobileInspectorNumericSlider from './MobileInspectorRow/MobileInspectorRowTypes/MobileInspectorNumericSlider';
import MobileInspectorTextInput from './MobileInspectorRow/MobileInspectorRowTypes/MobileInspectorTextInput';
import MobileInspectorNumericInput from './MobileInspectorRow/MobileInspectorRowTypes/MobileInspectorNumericInput';
import MobileInspectorDualNumericInput from './MobileInspectorRow/MobileInspectorRowTypes/MobileInspectorDualNumericInput';
import MobileInspectorSelector from './MobileInspectorRow/MobileInspectorRowTypes/MobileInspectorSelector';
import InspectorActionButton from '../../Inspector/InspectorActionButton/InspectorActionButton';
import InspectorImagePreview from '../../Inspector/InspectorPreview/InspectorPreviewTypes/InspectorImagePreview';
import InspectorSoundPreview from '../../Inspector/InspectorPreview/InspectorPreviewTypes/InspectorSoundPreview';
import MobileInspectorCheckbox from './MobileInspectorRow/MobileInspectorRowTypes/MobileInspectorCheckbox';
import MobileInspectorColor from './MobileInspectorRow/MobileInspectorRowTypes/MobileInspectorColor';

import MobileInspectorTabbedInterface from './MobileInpsectorTabbedInterface/MobileInspectorTabbedInterface';

import transformIcon from 'resources/mobile-inspector-icons/transform-icon.svg';
import transformIconActive from 'resources/mobile-inspector-icons/transform-icon-active.svg';
import styleIcon from 'resources/mobile-inspector-icons/style-icon.svg';
import styleIconActive from 'resources/mobile-inspector-icons/style-icon-active.svg';
import fontIcon from 'resources/mobile-inspector-icons/font-icon.svg';
import fontIconActive from 'resources/mobile-inspector-icons/font-icon-active.svg';
import settingsIcon from 'resources/mobile-inspector-icons/settings-icon.svg';
import settingsIconActive from 'resources/mobile-inspector-icons/settings-icon-active.svg';
import actionIcon from 'resources/mobile-inspector-icons/action-icon.svg';
import actionIconActive from 'resources/mobile-inspector-icons/action-icon-active.svg';

import xIcon from 'resources/mobile-inspector-icons/x-icon.svg';
import yIcon from 'resources/mobile-inspector-icons/y-icon.svg';
import wIcon from 'resources/mobile-inspector-icons/w-icon.svg';
import hIcon from 'resources/mobile-inspector-icons/h-icon.svg';
import scaleWIcon from 'resources/mobile-inspector-icons/scaleW-icon.svg';
import scaleHIcon from 'resources/mobile-inspector-icons/scaleH-icon.svg';
import rotateIcon from 'resources/mobile-inspector-icons/rotate-icon.svg';
import strokeIcon from 'resources/mobile-inspector-icons/strokewidth-icon.svg';
import opacityIcon from 'resources/mobile-inspector-icons/opacity-icon.svg';
import fillOpacityIcon from 'resources/mobile-inspector-icons/fillopacity-icon.svg';

class MobileInspector extends Component {
  constructor(props) {
    super(props);

    /**
     * Which actions should be shown for which selection types.
     */
    this.actionRules = {
      'breakApart': ["clip", "button",],
      'convertSelectionToButton': ["path", "text", "image", "multipath", "multiclip", "multicanvas"],
      'convertSelectionToClip': ["path", "text", "image", "multipath", "multiclip", "multicanvas"],
      'editTimeline': ["clip", "button"],
      'addAssetToCanvas': ["imageasset"],
    }

    /**
     * What titles should be displayed for each selection type?
     */
    this.inspectorTitles = {
      "frame": "Frame",
      "multiframe": "Multi-Frame",
      "tween": "Tween",
      "multitween": "Multi-Tween",
      "clip": "Clip",
      "button": "Button",
      "path": "Path",
      "text": "Text",
      "image": "Image",
      "multipath": "Multi-Path",
      "multiclip": "Multi-Clip",
      "multitimeline": "Multi-Timeline",
      "multicanvas": "Multi-Canvas",
      "imageasset": "Image Asset",
      "soundasset": "Sound Asset",
      "multiassetmixed": "Multi-Asset",
      "multisoundasset": "Multi-Asset Sound",
      "multiimageasset": "Multi-Asset Image",
      "unknown": "",
    }

    this.tabsOptions = {
      transform : { label: 'transform', icon: transformIcon, iconActive: transformIconActive, iconAlt: "transform icon" },
      style: { label: 'style', icon: styleIcon, iconActive: styleIconActive, iconAlt: "style icon" },
      font:  { label: 'font', icon: fontIcon, iconActive: fontIconActive, iconAlt: "font icon" },
      frameSettings: { label: 'frameSettings', icon: settingsIcon, iconActive: settingsIconActive, iconAlt: "setting icon" },
      tweenSettings: { label: 'tweenSsettings', icon: settingsIcon, iconActive: settingsIconActive, iconAlt: "setting icon" },
      animationSettings: { label: 'animationSettings', icon: settingsIcon, iconActive: settingsIconActive, iconAlt: "setting icon" },
      assetSettings: { label: 'assetSettings', icon: settingsIcon, iconActive: settingsIconActive, iconAlt: "setting icon" }, 
      actions: {label: 'actions', icon: actionIcon, iconActive: actionIconActive, iconAlt: "action icon"}
    }
    
    this.inspectorTabs = {
      "frame": ['frameSettings', 'identifier'],
      "layer": ['identifier'],
      "multiframe": [], // just name
      "tween": ['tweenSettings'],
      "multitween": ['tweenSettings'],
      "clip": ['transform', 'animationSettings', 'identifier'],
      "button": ['transform', 'identifier'],
      "path": ['transform', 'style'],
      "text": ['transform', 'style', 'font', 'identifier'],
      "image": ['transform'],
      "multipath": (this.getSelectionAttribute('fontFamily') && 
      typeof this.getSelectionAttribute('fontFamily') !== 'undefined') ? ['transform', 'style', 'font'] : ['transform', 'style'],
      "multiclip": ['transform'],
      "multitimeline": [],
      "multicanvas": ['transform'],
      "imageasset": ['assetSettings', 'name'],
      "soundasset": ['assetSettings', 'name'],
      "multiassetmixed": ['assetSettings'],
      "multisoundasset": ['assetSettings'],
      "multiimageasset": ['assetSettings'],
      "unknown": [],
    }

  }

  /**
   * Returns the value of a requested selection attribute.
   * @param  {string} attribute Selection attribute to retrieve.
   * @return {string|number|undefined} Value of the selection attribute to retrieve. Returns undefined is attribute does not exist.
   */
  getSelectionAttribute = (attribute) => {
    if (attribute === 'fillColorOpacity') {
      return this.getSelectionFillColorOpacity();
    }

    return this.props.getAllSelectionAttributes()[attribute];
  }

  /**
   * Returns the selection fill color opacity.
   * @return {string} fill color opacity from 0 to 1.
   */
  getSelectionFillColorOpacity = () => {
    return this.getSelectionAttribute('fillColor').alpha;
  }

  /**
   * Sets the value of the selection fillColor opacity.
   * @param  {string} attribute Selection attribute to retrieve.
   */
  setSelectionFillColorOpacity = (value) => {
    var color = this.getSelectionAttribute('fillColor');
    color.alpha = value;
    this.setSelectionAttribute('fillColor', color);
  }

  /**
   * Updates the value of a selection attribute for the selected item in the editor.
   * @param {string} attribute Name of the attribute to update.
   * @param {string|number} newValue  New value of the attribute to update.
   */
  setSelectionAttribute = (attribute, newValue) => {
    if (attribute === 'fillColorOpacity') {
      return this.setSelectionFillColorOpacity(newValue);
    }
    this.props.setSelectionAttribute(attribute, newValue);
  }

  // Inspector Row Types

  /**
   * Renders an inspector row allowing viewing and editing of the selection fill color.
   */
  renderSelectionColor = () => {
    return (
      <div className="mobile-inspector-item mobile-inspector-item-style">
        <div className="mobile-inspector-col-left">
          <MobileInspectorColor
            tooltip="Stroke"
            val={this.getSelectionAttribute('strokeColor').toCSS()}
            onChange={(col) => this.setSelectionAttribute('strokeColor', col)}
            id={"mobile-inspector-selection-stroke-color"}
            stroke={true}
            divider={false}
            colorPickerType={this.props.colorPickerType}
            changeColorPickerType={this.props.changeColorPickerType}
            updateLastColors={this.props.updateLastColors}
            lastColorsUsed={this.props.lastColorsUsed}
          />

          <MobileInspectorColor
            tooltip="Fill"
            val={this.getSelectionAttribute('fillColor').toCSS()}
            onChange={(col) => this.setSelectionAttribute('fillColor', col)}
            id={"mobile-inspector-selection-fill-color"}
            divider={false}
            colorPickerType={this.props.colorPickerType}
            changeColorPickerType={this.props.changeColorPickerType}
            updateLastColors={this.props.updateLastColors}
            lastColorsUsed={this.props.lastColorsUsed}
          />
        </div>

        <div className="mobile-inspector-col-right">
          <MobileInspectorNumericInput
            tooltip="Stroke Weight"
            icon={strokeIcon}
            iconAlt="Strokeweight Icon"
            val={this.getSelectionAttribute('strokeWidth')}
            onChange={(val) => this.setSelectionAttribute('strokeWidth', val)}
            divider={false}
          />

          {this.renderOpacity()}

          <MobileInspectorNumericSlider
            tooltip="Fill Opacity"
            icon={fillOpacityIcon}
            val={this.getSelectionAttribute('fillColorOpacity')}
            onChange={(val) => this.setSelectionAttribute('fillColorOpacity', val)}
            divider={false}
            inputProps={{ min: 0, max: 1, step: 0.01 }}
          />
        </div>
      </div>
    );
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selected object's font.
   */
  renderFontFamily = () => {
    let opts = this.props.fontInfoInterface.allFontNames;

    let getFontClass = (font) => {
      let fontClass = 'font-selector-' + font.split(" ").join("-");
      let existingClass = this.props.fontInfoInterface.isExistingFont(font) ? ' existing-font' : '';
      return fontClass + existingClass;
    };

    opts = opts.map(opt => {
      return {
        value: opt,
        label: opt,
        className: getFontClass(opt),
      }
    });

    return (
      <MobileInspectorSelector
        className="font-family"
        value={this.getSelectionAttribute('fontFamily')}
        tooltip="Font Family"
        type="select"
        isSearchable={true}
        options={opts}
        onChange={(val) => {
          let font = val.value;

          // Don't fetch the file if we already have it.
          if (this.props.fontInfoInterface.hasFont(val.value)) {
            this.setSelectionAttribute('fontFamily', font);
            return;
          }

          // Fetch the file if it's missing.
          this.props.fontInfoInterface.getFontFile({
            font: font,
            callback: blob => {
              var file = new File([blob], font + '.ttf', { type: 'font/ttf' });
              this.props.importFileAsAsset(file, () => {
                this.setSelectionAttribute('fontFamily', font)
              });
            },
            error: error => {
              console.error(error)
            }
          });

        }}>
      </MobileInspectorSelector>
    )
  }

  renderFontStyle = () => {
    let options = [{ value: 'normal', label: 'normal' }, { value: 'italic', label: 'italic' }]
    return (
      <MobileInspectorSelector
        tooltip="Style"
        type="select"
        isSearchable={true}
        value={this.getSelectionAttribute('fontStyle')}
        options={options}
        onChange={(val) => {
          this.setSelectionAttribute('fontStyle', val.value);
        }} />
    )
  }

  renderFontWeight = () => {
    let fontWeights = [
      { label: 'thin', value: 100 },
      { label: 'extra light', value: 200 },
      { label: 'light', value: 300 },
      { label: 'normal', value: 400 },
      { label: 'medium', value: 500 },
      { label: 'semi bold', value: 600 },
      { label: 'bold', value: 700 },
      { label: 'extra bold', value: 800 },
      { label: 'black', value: 900 },
    ];

    let weight = Math.min(Math.max(this.getSelectionAttribute('fontWeight'), 100), 900);

    return (
      <MobileInspectorSelector
        tooltip="Weight"
        type="select"
        isSearchable={true}
        value={weight}
        options={fontWeights}
        onChange={(val) => {
          let newWeight = val.value || 400;
          this.setSelectionAttribute('fontWeight', newWeight);
        }} />
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selection font size.
   */
  renderFontSize = () => {
    return (
      <MobileInspectorNumericInput
        tooltip="Font Size"
        val={this.getSelectionAttribute('fontSize')}
        onChange={(val) => this.setSelectionAttribute('fontSize', val)} />
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selection's name.
   */
  renderName = () => {
    return (
      <div className="mobile-inspector-item mobile-inspector-name">
        <MobileInspectorTextInput
          tooltip="Name"
          val={this.getSelectionAttribute('name')}
          onChange={(val) => { this.setSelectionAttribute('name', val); }}
          placeholder="no_name"
          id="inspector-name"
          divider={false} />
      </div>
    );
  }

  /**
   * Renders an inspector row allowing viewing and editing of a selection's identifier
   */
  renderIdentifier = () => {
    return (
      <div className="mobile-inspector-item mobile-inspector-name">
        <MobileInspectorTextInput
          tooltip="Name"
          val={this.getSelectionAttribute('identifier')}
          onChange={(val) => { this.setSelectionAttribute('identifier', val); }}
          placeholder="no_name"
          id="mobile-inspector-identifier"
          divider={false} />
      </div>
    );
  }

  /**
   * Renders an inspector row allowing viewing of the selection's file name.
   */
  renderFilename = () => {
    return (
      <div className="mobile-inspector-item">
        <MobileInspectorTextInput
          tooltip="File"
          val={this.getSelectionAttribute('filename')}
          readOnly={true}
          id="inspector-file-name" />
      </div>
    );
  }

  /**
   * Renders an inspector row allowing viewing of the selection's src image.
   */
  renderAssetPreview = () => {
    let selectionType = this.props.getSelectionType();
    if (selectionType === 'imageasset') {
      return (
        <InspectorImagePreview
          src={this.getSelectionAttribute('src')}
          id="inspector-image-preview" />
      );
    } else if (selectionType === 'soundasset') {
      return (
        <InspectorSoundPreview
          src={this.getSelectionAttribute('src')}
          id="inspector-sound-preview" />
      );
    }
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selection's frame length.
   */
  renderFrameLength = () => {
    return (
      <div className="mobile-inspector-item">
        <MobileInspectorNumericInput
          tooltip="Length"
          val={this.getSelectionAttribute('frameLength')}
          onChange={(val) => this.setSelectionAttribute('frameLength', val)}
          id="inspector-frame-length" />
      </div>
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selection's x y position.
   */
  renderPosition = () => {
    return (
      <MobileInspectorDualNumericInput
        tooltip1="Origin X"
        tooltip2="Origin Y"
        icon1={xIcon}
        iconAlt1="x Icon"
        icon2={yIcon}
        iconAlt2="Y Icon"
        val1={this.getSelectionAttribute('originX')}
        val2={this.getSelectionAttribute('originY')}
        onChange1={(val) => this.setSelectionAttribute('originX', val)}
        onChange2={(val) => this.setSelectionAttribute('originY', val)}
        id="inspector-origin" />
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selection's width and height.
   */
  renderSize = () => {
    return (
      <MobileInspectorDualNumericInput
        tooltip1="Width"
        tooltip2="Height"
        icon1={wIcon}
        iconAlt1="Width Icon"
        icon2={hIcon}
        iconAlt2="Height Icon"
        val1={this.getSelectionAttribute('width')}
        val2={this.getSelectionAttribute('height')}
        onChange1={(val) => this.setSelectionAttribute('width', val)}
        onChange2={(val) => this.setSelectionAttribute('height', val)}
        id="inspector-size" />
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selection's scaleX and scaleY.
   */
  renderScale = () => {
    return (
      <MobileInspectorDualNumericInput
        tooltip1="Scale W"
        tooltip2="Scale H"
        icon1={scaleWIcon}
        iconAlt1="Scale Width Icon"
        icon2={scaleHIcon}
        iconAlt2="Scale Height Icon"
        val1={this.getSelectionAttribute('scaleX')}
        val2={this.getSelectionAttribute('scaleY')}
        onChange1={(val) => this.setSelectionAttribute('scaleX', val)}
        onChange2={(val) => this.setSelectionAttribute('scaleY', val)}
        id="inspector-scale" />
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selection's rotation.
   */
  renderRotation = () => {
    return (
      <MobileInspectorNumericInput
        tooltip="Rotation"
        icon={rotateIcon}
        iconAlt="Rotation Icon"
        val={this.getSelectionAttribute('rotation')}
        onChange={(val) => this.setSelectionAttribute('rotation', val)}
        id="inspector-rotation" />
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selection's opacity.
   */
  renderOpacity = () => {
    return (
      <MobileInspectorNumericSlider
        tooltip="Opacity"
        icon={opacityIcon}
        val={this.getSelectionAttribute('opacity')}
        onChange={(val) => this.setSelectionAttribute('opacity', val)}
        divider={false}
        inputProps={{ min: 0, max: 1, step: 0.01 }}
        id="inspector-opacity" />
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of all transformation properties
   * icluding position, scale, size, rotation and opacity.
   */
  renderSelectionTransformProperties = () => {
    return (
      <div className="mobile-inspector-item">
        {this.renderPosition()}
        {this.renderSize()}
        {this.renderScale()}
        {this.renderRotation()}
      </div>
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of sound assets attached to the
   * current object.
   */
  renderSelectionSoundAsset = () => {
    let options = [{
      value: null,
      label: "No Sound"
    }]

    let mapAsset = asset => {
      if (!asset) {
        return {
          value: "novalue",
          label: "No Sound",
        }
      }
      return {
        value: asset,
        label: asset.name,
      }
    }

    options = options.concat(this.props.getAllSoundAssets().map(mapAsset));

    let value = this.getSelectionAttribute('sound');
    return (
      <MobileInspectorSelector
        tooltip="Sound"
        type="select"
        options={options}
        value={value}
        isSearchable={true}
        onChange={(val) => { this.setSelectionAttribute('sound', val.value) }} />
    );
  }

  renderSelectionSoundVolume = () => {
    return (
      <MobileInspectorNumericInput
        tooltip="Volume"
        val={this.getSelectionAttribute('soundVolume')}
        onChange={(val) => { this.setSelectionAttribute('soundVolume', val) }}
        id="inspector-sound-volume" />
    )
  }

  renderSelectionSoundStart = () => {
    return (
      <MobileInspectorNumericInput
        tooltip="Start (ms)"
        type="numeric"
        val={this.getSelectionAttribute('soundStart')}
        onChange={(val) => { this.setSelectionAttribute('soundStart', val) }} />
    )
  }

  renderSoundContent = () => {
    return (
      <div className="mobile-inspector-item">
        {this.renderSelectionSoundAsset()}
        {this.getSelectionAttribute('sound') && this.renderSelectionSoundVolume()}
        {this.getSelectionAttribute('sound') && this.renderSelectionSoundStart()}
      </div>
    )
  }

  renderAnimationType = () => {
    return (
      <div className="mobile-inspector-item">
        <MobileInspectorSelector
          tooltip="Animation"
          type="select"
          options={this.props.getClipAnimationTypes()}
          value={this.getSelectionAttribute('animationType')}
          isSearchable={true}
          onChange={(val) => { this.setSelectionAttribute('animationType', val.value) }} />
        {
          this.getSelectionAttribute('singleFrameNumber') &&
          <MobileInspectorNumericInput
            tooltip="Frame"
            val={this.getSelectionAttribute('singleFrameNumber')}
            onChange={(val) => this.setSelectionAttribute('singleFrameNumber', val)} />
        }
        {this.getSelectionAttribute('animationType') !== "single" &&
          <MobileInspectorCheckbox
            tooltip="Synced"
            checked={this.getSelectionAttribute('isSynced')}
            onChange={(val) => this.setSelectionAttribute('isSynced', !this.getSelectionAttribute('isSynced'))} />}
      </div>
    )
  }

  renderTweenEasingType = () => {
    let options = window.Wick.Tween.VALID_EASING_TYPES;
    let optionLabels = [];
    options.forEach((option) => {
      optionLabels.push({ label: option, value: option });
    })
    return (
      <div className="mobile-inspector-item">
        <MobileInspectorSelector
          tooltip="Easing Type"
          type="select"
          options={optionLabels}
          value={this.getSelectionAttribute('easingType')}
          isSearchable={true}
          onChange={(val) => { this.setSelectionAttribute('easingType', val.value) }} />
      </div>
    );
  }

  renderTweenFullRotations = () => {
    return (
      <div className="mobile-inspector-item">
        <MobileInspectorNumericInput
          tooltip="Full Rotations"
          val={this.getSelectionAttribute('fullRotations')}
          onChange={(val) => this.setSelectionAttribute('fullRotations', val)}
          id="inspector-full-rotation" />
      </div>
    );
  }

  // Selection contents and properties

  /**
   * Renders the inspector view for all properties of a frame.
   */
  renderFrame = () => {
    return (
      <div className="inspector-content">
        {/* {this.renderIdentifier()} */}
        {this.renderFrameLength()}
        {this.renderSoundContent()}
      </div>
    );
  }

  /**
   * Renders the inspector view for all properties of a tween selection.
   */
  renderTween = () => {
    return (
      <div className="inspector-content">
        {this.renderTweenEasingType()}
        {this.renderTweenFullRotations()}
      </div>
    );
  }

  renderFontContent = () => {
    return (
      <div className="mobile-inspector-item">
        {this.renderFontFamily()}
        {this.renderFontStyle()}
        {this.renderFontWeight()}
        {this.renderFontSize()}
      </div>
    )
  }


  /**
   * Renders the inspector view for clip animation type.
   */
  renderAnimationSetting = () => {
    return (
      <div className="inspector-content">
        {this.renderAnimationType()}
      </div>
    );
  }

  /**
   * Renders the inspector view for all properties of an asset selection.
   */
  renderAsset = () => {
    return (
      <div className="inspector-content">
        {this.renderName()}
        {this.renderFilename()}
        {this.renderAssetPreview()}
      </div>
    )
  }

  /**
   * Renders a default selection view with no properties.
   */
  renderUnknown = () => {
    return (
      <div>
        <div className="inspector-content">
        </div>
      </div>
    )
  }

  /**
   * Renders the proper view for the given selection type.
   * @param   {string} selectionType A string representation of the selection to display.
   * @returns {Component} JSX component to render.
   */
  renderDisplay = (selectionType) => {
    let renderFunction = null;

    if (selectionType in this.inspectorContentRenderFunctions) {
      renderFunction = this.inspectorContentRenderFunctions[selectionType];
    } else {
      renderFunction = this.renderUnknown;
    }

    return (
      renderFunction()
    );
  }

  /**
   * Renders a single action button for a given editor action.
   * @param {object} btn editor action with action, icon, color, and tooltip text properties.
   * @param {number} i unique key to be applied to returned object.
   * @returns {Component} JSX component to render.
   */
  renderActionButton = (action, i) => {
    return (
      <div key={i} className="mobile-inspector-item">
        <InspectorActionButton
          action={action} />
      </div>
    );
  }

  getAllActions = () => {
    let actions = [];
    let selectionType = this.props.getSelectionType();

    Object.keys(this.actionRules).forEach(action => {
      let actionList = this.actionRules[action];
      if (actionList.includes(selectionType)) actions.push(action);
    });
    return actions;
  }

  /**
   * Renders all actions for the current selection.
   * @returns {Component} JSX component containing all the actions for the current selection.
   */
  renderActions = () => {
    let actions = this.getAllActions();

    return (
      <div className="inspector-content">
        {actions.map((action, i) => {
          return this.renderActionButton(this.props.editorActions[action], i);
        })}
      </div>
    )
  }

  render() {
    let selectionType = this.props.getSelectionType();
    if (!Object.keys(this.inspectorTabs).includes(selectionType)) selectionType = "unknown";

    let tabNames = this.inspectorTabs[selectionType].concat([]);
    let tabs = tabNames.filter(ele => ele !== 'name' && ele !== 'identifier').map(name => this.tabsOptions[name]);

    let actions = this.getAllActions();

    if (actions.length > 0) {
      tabNames.push('actions');
      tabs.push(this.tabsOptions.actions);
    }

    return (
      <div className="mobile-inspector" aria-label="Inspector Panel">
        <div className="mobile-inspector-title">
          <span className="mobile-inspector-title-prefix">Inspect:</span> 
          {this.inspectorTitles[selectionType]}

          {tabNames.includes('identifier') ? this.renderIdentifier() : tabNames.includes('name') ? this.renderName() : undefined}
        </div>
        {selectionType === "unknown" && <div className='mobile-inspector-unknown-selection'>Unknown Selection</div>}
        
        {tabs.length > 0 &&
          <MobileInspectorTabbedInterface 
            tabs={tabs}>
            {tabNames.includes('transform') && <Fragment>{this.renderSelectionTransformProperties()}</Fragment>}
            {tabNames.includes('style') && <Fragment>{this.renderSelectionColor()}</Fragment>}
            {tabNames.includes('font') && <Fragment>{this.renderFontContent()}</Fragment>}
            {tabNames.includes('frameSettings') && <Fragment>{this.renderFrame()}</Fragment>}
            {tabNames.includes('tweenSettings') && <Fragment>{this.renderTween()}</Fragment>}
            {tabNames.includes('animationSettings') && <Fragment>{this.renderAnimationSetting()}</Fragment>}
            {tabNames.includes('assetSettings') && <Fragment>{this.renderAsset()}</Fragment>}
            {tabNames.includes('actions') && <Fragment>{this.renderActions()}</Fragment>}
          </MobileInspectorTabbedInterface>}
      </div>
    )
  }
}

export default MobileInspector
