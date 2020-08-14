import React, { useState } from 'react';

let classNames = require('classnames');

/**
 * Wick Button
 * 
 * Double Click Rules
 * Will always perform the single click action. 
 * Will perform the secondary action on a double click within 500 ms.
 * 
 * @param {*} props 
 */
export default function WickButton(props) {

  const [clicked, setClicked] = useState(false);

  /**
   * Initiates a delayed action, and fires double click if it exists. 
   */
  function handleClick() {
    if (props.secondaryAction) {
      if (clicked) { // doubleclick
        props.secondaryAction();
        setClicked(false);
      } else {
        // Do the Action.
        props.onClick && props.onClick();
        setClicked(true);

        // Prepare for double clicks.
        setTimeout(() => {
          setClicked(false);
        }, 500);
      }
    } else {
      props.onClick && props.onClick();
    }
  }

  return (
    <button
      {...props.buttonProps}
      onClick={() => {console.log("Clicking"); handleClick()}}
      onTouch={() => {console.log("Touching"); handleClick()}}
      className={classNames("wick-button ", props.className)}>
      {props.children}
    </button>
  )
}