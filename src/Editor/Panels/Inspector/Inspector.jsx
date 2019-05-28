/*
 * Copyright 2018 WICKLETS LLC
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
import './_inspector.scss';
import './_inspectorselector.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import InspectorTitle from './InspectorTitle/InspectorTitle';

import InspectorNumericSlider from './InspectorRow/InspectorRowTypes/InspectorNumericSlider';
import InspectorTextInput from './InspectorRow/InspectorRowTypes/InspectorTextInput';
import InspectorNumericInput from './InspectorRow/InspectorRowTypes/InspectorNumericInput';
import InspectorDualNumericInput from './InspectorRow/InspectorRowTypes/InspectorDualNumericInput';
import InspectorSelector from './InspectorRow/InspectorRowTypes/InspectorSelector';
import InspectorColorNumericInput from './InspectorRow/InspectorRowTypes/InspectorColorNumericInput';
import InspectorActionButton from './InspectorActionButton/InspectorActionButton';
import InspectorImagePreview from './InspectorPreview/InspectorPreviewTypes/InspectorImagePreview';
import InspectorScriptWindow from './InspectorScriptWindow/InspectorScriptWindow';

class Inspector extends Component {
  constructor (props) {
    super(props);

    /**
     * Which render function should be used for each selection type?
     */
    this.inspectorContentRenderFunctions = {
      "frame": this.renderFrame,
      "layer": this.renderLayer,
      "multiframe": this.renderMultiFrame,
      "tween": this.renderTween,
      "multitween": this.renderMultiTween,
      "clip": this.renderClip,
      "button": this.renderButton,
      "path": this.renderPath,
      "multipath": this.renderMultiPath,
      "multiclip": this.renderMultiClip,
      "multitimeline": this.renderMultiTimeline,
      "multicanvas": this.renderMultiCanvas,
      "imageasset": this.renderAsset,
      "soundasset": this.renderAsset,
      "multiassetmixed": this.renderAsset,
      "multisoundasset": this.renderAsset,
      "multiimageasset": this.renderAsset,
    }

    /**
     * Which actions should be shown for which selection types.
     */
    this.actionRules = {
      'breakApart': ["clip", "button",],
      'makeInteractive': ["path", "multipath", "multiclip", "multicanvas"],
      'makeAnimated': ["path", "multipath", "multiclip", "multicanvas"],
      'editTimeline': ["clip", "button"],
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
      "multipath": "Multi-Path",
      "multiclip": "Multi-Clip",
      "multitimeline": "Multi-Timeline",
      "multicanvas": "Multi-Canvas",
      "imageasset": "Image Asset",
      "soundasset": "Sound Asset",
      "multiassetmixed": "Multi-Asset",
      "multisoundasset": "Multi-Asset Sound",
      "multiimageasset": "Multi-Asset Image",
      "unknown": "Unknown",
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
   * Renders an inspector row allowing viewing and editing of the selection stroke width.
   */
  renderSelectionStrokeWidth = () => {
    return (
      <InspectorNumericSlider
        tooltip="Stroke Width"
        val={this.getSelectionAttribute('strokeWidth')}
        onChange={(val) => this.setSelectionAttribute('strokeWidth', val)}
        divider={false}
        inputProps={this.getSelectionInputProps('strokeWidth')}
        id="inspector-selection-stroke-width"/>
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selection fill color.
   */
  renderSelectionFillColor = () => {
    return (
      <div className="inspector-item">
        <InspectorColorNumericInput
          tooltip="Fill Color"
          val={this.getSelectionAttribute('fillColor').toCSS()}
          onChange={(col) => this.setSelectionAttribute('fillColor', col)}
          id={"inspector-selection-fill-color"}
          val2={this.getSelectionAttribute('fillColorOpacity')}
          onChange2={(val) => this.setSelectionAttribute('fillColorOpacity', val)}
          divider={false}
        />
      </div>
    );
  }
  /**
   * Renders an inspector row allowing viewing and editing of the selection stroke color.
   */
  renderSelectionStrokeColor = () => {
    return (
      <div className="inspector-item">
        <InspectorColorNumericInput
          tooltip="Stroke Color"

          val={this.getSelectionAttribute('strokeColor').toCSS()}
          onChange={(col) => this.setSelectionAttribute('strokeColor', col)}
          id={"inspector-selection-stroke-color"}
          stroke={true}

          val2={this.getSelectionAttribute('strokeWidth')}
          onChange2={(val) => this.setSelectionAttribute('strokeWidth', val)}
          divider={false}
        />
      </div>
    );
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selected object's font.
   */
  renderFontFamily = () => {
    let opts = this.props.fontInfoInterface.allFontNames;

    let getFontName = (font) => 'font-selector-' + font.split(" ").join("-");

    opts = opts.map(opt => {
      return {
        value: opt, 
        label: opt,
        className: getFontName(opt),
      }
    });

    return (
      <div style ={{width: '100%'}}>
      <link href="https://fonts.googleapis.com/css?family=Lily+Script+One&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Knewave&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Erica+One&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Goblin+One&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Assistant&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Gloria+Hallelujah&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Pathway+Gothic+One&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Offside&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Allerta+Stencil&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Mukta&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Port+Lligat+Slab&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Mr+Bedfort&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Habibi&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Balthazar&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Cagliostro&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Almendra+SC&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Damion&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Permanent+Marker&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Abel&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Rochester&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Patua+One&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Merienda+One&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Fjalla+One&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Allerta&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Trykker&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Loved+by+the+King&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Voltaire&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Open+Sans&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Archivo+Narrow&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Numans&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Candal&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Titillium+Web&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Gafata&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Geostar+Fill&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Cinzel&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Strait&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Yanone+Kaffeesatz&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Quicksand&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Inder&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Noto+Sans&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Lemon&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Annie+Use+Your+Telescope&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Boogaloo&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Crimson+Text&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Pompiere&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Bitter&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Arimo&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Kite+One&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Noticia+Text&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Fugaz+One&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Libre+Barcode+39&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Ubuntu+Condensed&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Nothing+You+Could+Do&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Lato&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Medula+One&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=fontList.json&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Tauri&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Lobster&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Port+Lligat+Sans&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Graduate&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Dancing+Script&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Anton&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Libre+Barcode+39+Text&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Prociono&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Fresca&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Poller+One&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Architects+Daughter&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Keania+One&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Mate+SC&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Bubbler+One&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Fira+Sans+Condensed&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Cairo&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=UnifrakturCook&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Hind+Siliguri&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Hind+Madurai&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Antic+Slab&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Lustria&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Galdeano&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Iceberg&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Convergence&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Krona+One&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Cabin&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Source+Serif+Pro&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Lilita+One&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Inconsolata&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Dosis&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Montaga&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Sail&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Spinnaker&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Homenaje&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Indie+Flower&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Chela+One&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Shadows+Into+Light+Two&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Marko+One&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Questrial&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Abril+Fatface&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Passero+One&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Nunito&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Telex&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Oswald&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Kotta+One&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Domine&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Francois+One&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Dorsa&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Squada+One&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Roboto+Mono&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Text+Me+One&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Vampiro+One&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Ruluko&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Overlock+SC&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Tulpen+One&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Righteous&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Nunito+Sans&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Amatic+SC&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Libre+Barcode+39+Extended+Text&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Cambo&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Vollkorn&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Ceviche+One&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Gochi+Hand&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Libre+Barcode+39+Extended&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Playfair+Display&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Slabo+27px&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Fauna+One&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Wendy+One&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Kanit&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Roboto&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Unlock&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Plaster&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Pacifico&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Antic+Didone&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Belgrano&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Catamaran&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Ropa+Sans&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Belleza&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Italiana&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Gilda+Display&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Shadows+Into+Light&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Julee&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Euphoria+Script&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Macondo+Swash+Caps&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Viga&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Play&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Libre+Franklin&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Holtwood+One+SC&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Poppins&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Libre+Barcode+128&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Average&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Germania+One&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Imprima&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Raleway&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Sofia&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Arvo&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Slackey&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Rammetto+One&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Source+Code+Pro&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=News+Cycle&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Contrail+One&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css?family=Iceland&display=swap" rel="stylesheet"/>
      <InspectorSelector
        value={this.getSelectionAttribute('fontFamily')}
        tooltip="Font Family"
        type="select"
        isSearchable={true}
        options={opts}
        onChange={(val) => {
          let font = val.value;
          this.props.fontInfoInterface.getFontFile({
            font: font,
            variant: 'regular',
            callback: blob => {
              var file = new File([blob], font+'.ttf', {type:'font/ttf'});
              this.props.importFileAsAsset(file, () => {
                this.setSelectionAttribute('fontFamily', font)
              });
            },
            error: error => {
              console.error(error)
            }
          });
        }}>   
        </InspectorSelector>
      </div>
    )
  }

  renderFontStyle = () => {
    return (
      <InspectorSelector
        tooltip="Style"
        type="select"
        isSearchable={true}
        value={this.getSelectionAttribute('fontStyle')}
        options={['regular', 'italic']}
        onChange={(val) => {
          this.setSelectionAttribute('fontVariant', val.value);
        }} />
    )
  }

  renderFontWeight = () => {
    let fontWeightOptions =['thin', 'extra light', 'light', 'normal', 'medium', 'semi bold', 'bold', 'extra bold', 'black'];

    return (
      <InspectorSelector
        tooltip="Weight"
        type="select"
        isSearchable={true}
        value={this.getSelectionAttribute('fontWeight')}
        options={fontWeightOptions}
        onChange={(val) => {
          this.setSelectionAttribute('fontWeight', (fontWeightOptions.indexOf(val.value) * 100));
        }} />
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selection font size.
   */
  renderFontSize = () =>  {
    return (
      <InspectorNumericInput
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
      <div className="inspector-item">
        <InspectorTextInput
          tooltip="Name"
          val={this.getSelectionAttribute('name')}
          onChange={(val) => {this.setSelectionAttribute('name', val);}}
          placeholder="no_name"
          id="inspector-name" />
      </div>
    );
  }

  /**
   * Renders an inspector row allowing viewing and editing of a selection's identifier
   */
  renderIdentifier = () => {
    return (
      <div className="inspector-item">
        <InspectorTextInput
          tooltip="Name"
          val={this.getSelectionAttribute('identifier')}
          onChange={(val) => {this.setSelectionAttribute('identifier', val);}}
          placeholder="no_name"
          id="inspector-name" />
      </div>
    );
  }

  /**
   * Renders an inspector row allowing viewing of the selection's file name.
   */
  renderFilename = () => {
    return (
      <div className="inspector-item">
        <InspectorTextInput
          tooltip="File Name"
          val={this.getSelectionAttribute('filename')}
          readOnly={true}
          id="inspector-file-name"/>
      </div>
    );
  }

  /**
   * Renders an inspector row allowing viewing of the selection's src image.
   */
  renderImagePreview = () => {
    return (
      <InspectorImagePreview
        src={this.getSelectionAttribute('src')}
        id="inspector-image-preview" />
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selection's frame length.
   */
  renderFrameLength = () => {
    return (
      <div className="inspector-item">
        <InspectorNumericInput
          tooltip="Frame Length"
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
      <InspectorDualNumericInput
        tooltip="Position"
        val1={this.getSelectionAttribute('x')}
        val2={this.getSelectionAttribute('y')}
        onChange1={(val) => this.setSelectionAttribute('x', val)}
        onChange2={(val) => this.setSelectionAttribute('y', val)}
        divider={true}
        id="inspector-position" />
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selection's width and height.
   */
  renderSize = () => {
    return (
      <InspectorDualNumericInput
        tooltip="Size"
        val1={this.getSelectionAttribute('width')}
        val2={this.getSelectionAttribute('height')}
        onChange1={(val) => this.setSelectionAttribute('width', val)}
        onChange2={(val) => this.setSelectionAttribute('height', val)}
        divider={true}
        id="inspector-size" />
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selection's scaleX and scaleY.
   */
  renderScale = () => {
    return (
      <InspectorDualNumericInput
        tooltip="Scale"
        val1={this.getSelectionAttribute('scaleX')}
        val2={this.getSelectionAttribute('scaleY')}
        onChange1={(val) => this.setSelectionAttribute('scaleX', val)}
        onChange2={(val) => this.setSelectionAttribute('scaleY', val)}
        divider={true}
        id="inspector-scale" />
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selection's rotation.
   */
  renderRotation = () => {
    return (
      <InspectorNumericInput
        tooltip="Rotation"
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
      <InspectorNumericSlider
        tooltip="Opacity"
        val={this.getSelectionAttribute('opacity')}
        onChange={(val) => this.setSelectionAttribute('opacity', val)}
        divider={false}
        inputProps={{min: 0, max: 1, step: 0.01}}
        id="inspector-opacity"/>
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of all transformation properties
   * icluding position, scale, size, rotation and opacity.
   */
  renderSelectionTransformProperties = () => {
    return (
      <div className="inspector-item">
        {this.renderPosition()}
        {this.renderSize()}
        {/*this.renderScale() disabled scale temporarily -zj */}
        {this.renderRotation()}
        {this.renderOpacity()}
      </div>
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of sound assets attached to the
   * current object.
   */
  renderSelectionSoundAsset = () => {
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

    let options = this.props.getAllSoundAssets().map(mapAsset);

    options.unshift({
      value: "",
      label: "No Sound",
    });

    let value = mapAsset(this.getSelectionAttribute('sound'));
    return (
      <InspectorSelector
        tooltip="Sound"
        type="select"
        options={options}
        value={value}
        isSearchable={true}
        onChange={(val) => {this.setSelectionAttribute('sound', val.value)}} />
    );
  }

  renderSelectionSoundVolume = () => {
    return (
      <InspectorNumericInput
        tooltip="Volume"
        type="numeric"
        value={this.getSelectionAttribute('soundVolume')}
        onChange={(val) => {this.setSelectionAttribute('soundVolume', val)}} />
    )
  }

  renderSelectionSoundStart = () => {
    return (
      <InspectorNumericInput
        tooltip="Sound Start"
        type="numeric"
        value={this.getSelectionAttribute('soundStart')}
        onChange={(val) => {this.setSelectionAttribute('soundStart', val)}} />
    )
  }

  renderSoundContent = () => {
    return (
      <div className="inspector-item">
        {this.renderSelectionSoundAsset()}
        {/* {sound !== null && this.renderSelectionSoundVolume()} */}
        {/* {sound !== null && this.renderSelectionSoundStart()} */}
      </div>
    )
  }

  renderTweenEasingType = () => {
    let options = window.Wick.Tween.VALID_EASING_TYPES;

    return (
      <div className="inspector-item">
        <InspectorSelector
          tooltip="Easing Type"
          type="select"
          options={options}
          value={this.getSelectionAttribute('easingType')}
          isSearchable={true}
          onChange={(val) => {this.setSelectionAttribute('easingType', val.value)}} />
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
          {this.renderIdentifier()}
          {/*this.renderFrameLength()*/}
          {this.renderSoundContent()}
        </div>
    );
  }

  /**
   * Renders the inspector view for all properties of a layer.
   */
  renderLayer = () => {
    return  (
      <div className="inspector-content">
        {this.renderName()}
      </div>
    )
  }

  /**
   * Renders the inspector view for all properties of a multi-frame selection.
   */
  renderMultiFrame = () => {
    return ( <div className="inspector-content" /> );
  }

  /**
   * Renders the inspector view for all properties of a multi-clip selection.
   */
  renderMultiClip = () => {
    return ( <div className="inspector-content" /> );
  }

  /**
   * Renders the inspector view for all properties of a tween selection.
   */
  renderTween = () =>  {
    return (
      <div className="inspector-content">
        {this.renderTweenEasingType()}
      </div>
     );
  }

  /**
   * Renders the inspector view for all properties of a multi-tween selection.
   */
  renderMultiTween = () => {
    return ( <div className="inspector-content"/> );
  }

  /**
   * Renders the inspector view for all properties of a selection with group properties.
   */
  renderGroupContent = () => {
    return (
      <div className="inspector-content">
        {this.renderIdentifier()}
        {this.renderSelectionTransformProperties()}
      </div>
    );
  }

  /**
   * Renders the inspector view for all properties of a group selection.
   */
  renderGroup = () => {
    return ( this.renderGroupContent() );
  }

  /**
   * Renders the inspector view for all properties of a multi-group selection.
   */
  renderMultiGroup = () => {
    return ( this.renderGroupContent() );
  }

  /**
   * Renders the inspector view for all properties of a clip selection.
   */
  renderClip = () => {
    return ( this.renderGroupContent() );
  }

  /**
   * Renders the inspector view for all properties of a button selection.
   */
  renderButton = () => {
    return ( this.renderGroupContent() );
  }

  renderFontContent = () => {
    return (
      <div className="inspector-item">
        {this.renderFontFamily()}
        {/* {this.renderFontStyle()}
        {this.renderFontWeight()} */}
        {this.renderFontSize()}
      </div>
    )
  }

  /**
   * Renders the inspector view for all properties of a selection with path properties.
   */
  renderPathContent = () => {
    return(
      <div className="inspector-content">
        {this.renderSelectionTransformProperties()}
        {this.renderSelectionFillColor()}
        {this.renderSelectionStrokeColor()}
        {this.getSelectionAttribute("fontFamily") && this.renderFontContent()}
      </div>
    );
  }

  /**
   * Renders the inspector view for all properties of a path selection.
   */
  renderPath = () => {
    return ( this.renderPathContent() );
  }

  /**
   * Renders the inspector view for all properties of a multi-path selection.
   */
  renderMultiPath = () => {
    return ( this.renderPathContent() );
  }

  /**
   * Renders the inspector view for all properties of a multi-canvas selection.
   */
  renderMultiCanvas = () => {
    return ( this.renderSelectionTransformProperties() )
  }

  /**
   * Renders the inspector view for all properties of a multi-timeline selection.
   */
  renderMultiTimeline = () => {
    return (
      <div>
      </div>
    )
  }

  /**
   * Renders the inspector view for all properties of an asset selection.
   */
  renderAsset = () => {
    return (
      <div className="inspector-content">
        {this.renderName()}
        {this.renderFilename()}
        {this.renderImagePreview()}
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
  renderActionButton = (btn, i) => {
    return (
      <div key={i} className="inspector-item">
        <InspectorActionButton
          btn={btn} />
      </div>
    );
  }

  /**
   * Renders all actions for the current selection.
   * @returns {Component} JSX component containing all the actions for the current selection.
   */
  renderActions = () => {
    let actions = [];
    let selectionType = this.props.getSelectionType();

    Object.keys(this.actionRules).forEach(action => {
        let actionList = this.actionRules[action];
        if (actionList.indexOf(selectionType) > -1) actions.push(action);
    });

    return(
      <div className="inspector-content">
        {actions.map((action, i) => {
            return this.renderActionButton(this.props.editorActions[action], i);
          })}
      </div>
    )
  }

  /**
   * Renders an edit script window if a script exists for the selected object.
   * @returns {Component} JSX component containing script window.
   */
  renderScripts = () => {
    return (
      <div className="inspector-item">
        <InspectorScriptWindow
          script={this.props.script}
          deleteScript={this.props.deleteScript}
          editScript={this.props.editScript}
          scriptInfoInterface={this.props.scriptInfoInterface}
        />
      </div>
    );
  }

  /**
   * Renders the inspector title for the current selection.
   * @param {string} selectionType selection type to return.
   */
  renderTitle = (selectionType) => {
    if (!(selectionType in this.inspectorTitles)) selectionType = "";

    return (
      <div className="inspector-title-container">
        <InspectorTitle
          type={selectionType}
          title={this.inspectorTitles[selectionType]} />
      </div>
    );
  }

  render() {
    let selectionType = this.props.getSelectionType();
    return(
      <div className="docked-pane inspector">
        {this.renderTitle(selectionType)}
        <div className="inspector-body">
          {this.renderDisplay(selectionType)}
          {this.renderActions()}
          {this.props.selectionIsScriptable() && this.renderScripts()}
        </div>
      </div>
    )
  }
}

export default Inspector
