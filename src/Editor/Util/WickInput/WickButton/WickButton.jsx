import React, { useState } from 'react';

let classNames = require('classnames');

export default function WickButton(props) {

  const [clicked, setClicked] = useState(false);
  const [nextAction, setNextAction] = useState(null);

  /**
   * Initiates a delayed action, and fires double click if it exists. 
   */
  function handleClick() {
    if (props.secondaryAction) {
      if (clicked) { // doubleclick
        props.secondaryAction();
        setNextAction(null);
        setClicked(false);
      } else {
        setNextAction(props.onClick);
        setClicked(true);
        setTimeout(() => {
          nextAction && nextAction();
          setNextAction(null);
          setClicked(false);
        }, 200);
      }
    } else {
      props.onClick && props.onClick();
    }
  }

  return (
    <button
      {...props.buttonProps}
      onClick={handleClick}
      className={classNames("wick-button ", props.className)}>
      {props.children}
    </button>
  )
}