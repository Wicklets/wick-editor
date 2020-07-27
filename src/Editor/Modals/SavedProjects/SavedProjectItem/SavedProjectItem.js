import React from 'react';

import './_savedprojectitem.scss';

let classNames = require('classnames');

export default function SavedProjectItem(props) {
   return (
      <div onClick={props.onClick} className={classNames("saved-project-item", {selected: props.selected})}>
         <h4 className="saved-project-item-name">{props.item.name}</h4>
         <div className="saved-project-item-detail-container">
            <div className="saved-project-item-date">{props.item.date}</div>
            <div className="saved-project-item-size">{props.item.size}</div>
         </div>
      </div>
   )
}