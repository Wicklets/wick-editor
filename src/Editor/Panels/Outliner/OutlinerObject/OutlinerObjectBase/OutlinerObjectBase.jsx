import React, { Component } from 'react';

import '../../_outliner.scss';

class OutlinerObjectBase extends Component {
  render() {
    return (
      <button className={this.props.className}
      onClick={this.props.onClick}/>);
  }
}

export default OutlinerObjectBase;