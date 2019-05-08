import React, { Component } from 'react';

import './_selectsubtabbutton.scss'; 

var classNames = require('classnames');

class SelectSubTabButton extends Component {

    render () {
        return (
            <div 
                className={classNames("select-sub-tab", {'selected': this.props.selected === this.props.name})}
                onClick={() => this.props.action(this.props.name)}>
                {this.props.name}
            </div>
        );
    }
}

export default SelectSubTabButton; 