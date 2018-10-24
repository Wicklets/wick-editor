import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, } from 'reactstrap';

import 'Editor/_wickbrand.scss';
import './_alphawarning.scss';

class AlphaWarning extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modal: true
    }

    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState({
      modal: !this.state.modal
    });
  }


  render() {
    return (
      <Modal id="alpha-modal" backdrop="static" isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
        <ModalHeader className="alpha-warning-header" toggle={this.toggle}>Wick Editor 1.0 Alpha v0</ModalHeader>
        <ModalBody>
          <h3>Welcome to Wick Editor 1.0</h3>
          <h5>In this alpha test, you'll have access to some of the most <b>basic</b> features of the Wick Editor.</h5>
          <p>Right now, you can test some of the new drawing tools, and our new and improved engine! This demo is missing functionality, tools, and much of the styling, but we hope it shows you what is possible with the new Wick Editor 1.0.</p>
          <p>More features and changes are on the way!</p>
        </ModalBody>
        <ModalFooter>
          <Button className="alpha-warning-modal-button" color="wick-warning" onClick={() => window.location.href="http://www.wickeditor.com"}>No Thanks...</Button>
          <Button className="alpha-warning-modal-button" color="wick-accept" onClick={this.toggle}>Try the Alpha</Button>{' '}
        </ModalFooter>
      </Modal>
    );
  }
}

export default AlphaWarning
