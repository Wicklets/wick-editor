import React, { Component } from 'react';

import ActionButton from 'Editor/Util/ActionButton/ActionButton';

import './_addeventbutton.scss';

class AddEventButton extends Component {

  render() {
    return (
      <div className="add-event-button-wrapper">
        <ActionButton
          text={"+" +  this.props.text}
          action={this.props.action}
          color="sky"/>
      </div>
    )
  }
}

export default AddEventButton
