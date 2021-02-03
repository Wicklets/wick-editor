import React, { useState, useEffect } from 'react';
import ExportModule from './ExportModule';
import WickInput from 'Editor/Util/WickInput/WickInput';

import 'Editor/styles/Modals/Export/_exportsize.css';

const classNames = require('classnames');

export default function ExportSize (props) {
  const [dropdownOption, setDropdownOption] = useState('1080p')

  const commonSizeOptions = [
    {
      name: '1080p',
      width: 1920,
      height: 1080
    },
    {
      name: '720p',
      width: 1280,
      height: 720
    },
    {
      name: "420p",
      width: 720,
      height: 480
    }
  ]

  // Create options for the react-select dropdown.
  let dropdownOptions = commonSizeOptions.map(option => {return {
    value: option.name,
    label: option.name
  }});

  dropdownOptions.push({
    value: 'custom',
    label: 'custom'
  });

  useEffect(() => {
    for (let option of commonSizeOptions) {
      if (props.size.width === option.width && props.size.height === option.height) {
        setDropdownOption(option.name);
        break;
      } else {
        setDropdownOption('custom');
      }
    }
  }, [props.size.width, props.size.height])

  function updateSize (width, height) {
    props.onChange({width, height});
  }

  // // Rounds size to nearest even value.
  // // mp4 width and height must be multiples of 2.
  // function fixSize (size) {
  //   if (size < 2) return 2;
  //   let excess = size % 2;
  //   return size - excess;
  // }

  function updateWidth (width) {
    updateSize(width, props.size.height);
  }

  function updateHeight (height) {
    updateSize(props.size.width, height);
  }

  // function LinkButton () {
  //   return (
  //     <button 
  //       onClick={() => setLinked(!linked)}
  //       className="link-button">
  //       <ToolIcon 
  //         className="link-icon"
  //         name={linked ? "link" : "unlink"} />
  //     </button>
  //   )
  // }

  function SizeButton (props) {

    let matchWidth = props.originalWidth * props.modifier;
    let matchHeight = props.originalHeight * props.modifier;

    return (
      <button 
        onClick={() => updateSize(props.originalWidth * props.modifier, props.originalHeight * props.modifier)}
        className={classNames("size-option", {'selected': (matchHeight === props.size.height && matchWidth === props.size.width)})}>
          {props.modifier + 'x'}
      </button>
    )
  }

  function SizeDropdown (props) {
    let onChange = (val) => {
      if (val.value !== 'custom') {
        let option = commonSizeOptions.find(opt => opt.name === val.value);
        updateSize(option.width, option.height);
      }
    };

    for (let option of dropdownOptions) {
      let size = commonSizeOptions.find(opt => opt.name === option.value);
      if (!size) continue;

      if (size.width === props.size.width && size.height === props.size.height) {
        setDropdownOption(option.value);
      }
    }

    return (
      <WickInput 
        onChange={onChange}
        type="select"
        value={dropdownOption}
        options={dropdownOptions}/>
    )
  }

  return (
    <ExportModule
      title="Size"
    >
       <table className="export-size-table">
         <tbody>
           <tr>
             <td>Width</td>
             <td></td>
             <td>Height</td>
           </tr>
           <tr>
             <td>
              <WickInput
                min={0}
                value={props.size.width}
                onChange={updateWidth}
                type="numeric"/>
             </td>
            <td className="export-link-icon">
              {/* <LinkButton /> */}
            </td>
            <td>
              <WickInput
                min={0}
                value={props.size.height}
                onChange={updateHeight}
                type="numeric" />
            </td>
           </tr>
           <tr>
             <td>
               <SizeButton size={props.size} originalWidth={props.originalWidth} originalHeight={props.originalHeight} modifier={1}/>
               <SizeButton size={props.size} originalWidth={props.originalWidth} originalHeight={props.originalHeight} modifier={2}/>
               <SizeButton size={props.size} originalWidth={props.originalWidth} originalHeight={props.originalHeight} modifier={3}/>
             </td>
             <td></td>
             <td>
                <SizeDropdown size={props.size} />
              </td>
           </tr>
          
         </tbody>
       </table>

    </ExportModule>
  )
}

