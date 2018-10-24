import React, { Component } from 'react';
import { Popover } from 'reactstrap';
import { SketchPicker } from 'react-color';

import './_colorpicker.scss';

class ColorPicker extends Component {
  constructor (props) {
    super(props);

    this.state = {
      open: false,
      color: "#FFFFFF"
    }

    this.toggle = this.toggle.bind(this);
  }

  toggle () {
    this.setState({
      open: !this.state.open
    });
  }

  render() {
    return(
      <div className="color-picker">
        <div className="btn-color-picker" id={this.props.id + '-button'} onClick={this.toggle} />
        <Popover
          placement={this.props.placement}
          isOpen={this.state.open}
          target={this.props.id + '-button'}
          toggle={this.toggle}
        >
          <SketchPicker
            disableAlpha={ this.props.disableAlpha }
            color={ this.props.color }
            onChangeComplete={ this.props.onChangeComplete }
          />
        </Popover>
      </div>
    )
  }
}

export default ColorPicker
