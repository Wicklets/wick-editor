import React, { Component } from 'react';

import ProjectSettings from '../ProjectSettings/ProjectSettings';
import AlphaWarning from '../AlphaWarning/AlphaWarning';

class ModalHandler extends Component {
  render() {
    return (
      <div>
        <ProjectSettings
          project={this.props.project}
          updateProjectSettings={this.props.updateProjectSettings}
          openModal={this.props.openModal}
          open={this.props.openModalName === 'ProjectSettings'}
        />
      <AlphaWarning className="alpha-warning"/>
      </div>
    );
  }
}

export default ModalHandler
