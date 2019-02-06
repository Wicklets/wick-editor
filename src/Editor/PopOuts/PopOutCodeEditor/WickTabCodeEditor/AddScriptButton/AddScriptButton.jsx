import React, { Component } from 'react';

import ActionButton from 'Editor/Util/ActionButton/ActionButton';

import './_addscriptbutton.scss';

class AddScriptButton extends Component {

  render() {
    return (
      <div className="add-script-button-wrapper">
        <ActionButton
          text={"+" +  this.props.text}
          action={this.props.action}
          color="sky"/>
      </div>
    )
  }
}

export default AddScriptButton
