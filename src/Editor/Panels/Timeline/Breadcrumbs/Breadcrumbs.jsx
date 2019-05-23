/*
 * Copyright 2018 WICKLETS LLC
 *
 * This file is part of Wick Editor.
 *
 * Wick Editor is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Wick Editor is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Wick Editor.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { Component } from 'react';
import ActionButton from 'Editor/Util/ActionButton/ActionButton';

import './_breadcrumbs.scss';

class Breadcrumbs extends Component {
  renderBreadcrumb = (object, i) => {
    return (
      <div key={i} className="breadcrumb-button-container">
        <ActionButton
          text={object.identifier || object.classname}
          action={() => this.props.setFocusObject(object)}
          color="breadcrumb" />
      </div>
    );
  }

  render() {
    let project = this.props.project;
    let lineage = project.focus.lineage;
    lineage = lineage.reverse(); // Set items in order.

    return (
      <div id="breadcrumbs-container">
        {lineage.map((obj,i) => this.renderBreadcrumb(obj,i))}
      </div>
    );
  }
}

export default Breadcrumbs;
