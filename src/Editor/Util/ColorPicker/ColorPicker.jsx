import React, { Component } from 'react';
import { Button, Popover } from 'reactstrap';
import { SketchPicker } from 'react-color';

class ColorPicker extends Component {
  constructor (props) {
    super(props);

    this.state = {
      open: false,
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
      <div>
        <Button id="Popover1" onClick={this.toggle}></Button>
        <Popover
          placement={this.props.placement}
          isOpen={this.state.open}
          target="Popover1"
          toggle={this.toggle}
        >
          <SketchPicker
            disableAlpha={ this.props.disableAlpha }
            color={ this.props.color }
            onChangeComplete={ this.props.onColorChange }
          />
        </Popover>
      </div>
    )
  }
}

export default ColorPicker
