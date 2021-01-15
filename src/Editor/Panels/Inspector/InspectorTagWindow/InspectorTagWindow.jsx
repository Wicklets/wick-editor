/*
 * Copyright 2021 WICKLETS LLC
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

import React from 'react';
import WickInput from '../../../Util/WickInput/WickInput';

import "./_inspectortagwindow.scss";

export default function InspectorTagWindow (props) {

    let projectTags = props.getProjectClipTags();
    let clipTags = props.getSelectedClipTags();

    let allTags = [];
    let selected = [];

    for (let tag of projectTags) {
        let obj = {
            value: tag,
            label: tag
        }

        allTags.push(obj);

        if (clipTags.includes(tag)) {
            selected.push(obj);
        }
    }

    let onChange = (value, item, action) => {
        if (item.action === 'remove-value') {
            props.removeClipTagFromSelection(item.removedValue.value);
        } else if (item.action === 'select-option') {
            props.addClipTagToSelection(item.option.value);
        }
    }

    return (
        <div className="inspector-tag-window-container">
            <div className="inspector-tag-window-title">
                Tags
            </div>
            <WickInput
                onCreateOption={props.addClipTagToSelection}
                onChange={onChange}
                value={selected}
                type="createable-select"
                options={allTags}
                className="tag-select" 
                placeholder="+ New Tag" />
        </div>
    )
} 
