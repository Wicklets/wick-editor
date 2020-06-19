import React, { Component } from 'react';

import './_outlinername.scss';

class OutlinerName extends Component {
  render() {
    let type = this.props.type;
    let name = this.props.name;
    return (
      <div className={"outliner-name-" + type}>
        {name}
      </div>
    );
  }
}

export default OutlinerName;