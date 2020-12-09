/*
 * Copyright 2020 WICKLETS LLC
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

import React, { useState } from 'react';
import { select } from 'underscore';

import './_mobileinspectortabbedinterface.scss';

var classNames = require('classnames'); 

export default function MobileInspectorTabbedInterface (props) {
    const [selectedTab, setSelectedTab] = useState(props.tabs[0].label);

    /**
     * Renders the selectable tab bar.
     */
    function renderTabs () {
        return (
            <div role="tablist" className="mobile-inspector-tabbed-interface-main-tab-container">
                {props.tabs.map( (tab, i) => 
                    <button
                        key={`tab-${tab.label}-${i}`}
                        className={classNames("mobile-inspector-tabbed-interface-main-tab", 
                                                "mobile-inspector-"+tab.label+"-tab", 
                                                props.tabClassName, 
                                                {"selected": tab.label === selectedTab})}
                        onClick={() => {setSelectedTab(tab.label)}}>

                        <img className={classNames("mobile-inspector-tabbed-interface-icon",
                                                    "mobile-inspector-"+tab.label+"-tab-icon")}
                             src={selectedTab === tab.label ? tab.iconActive : tab.icon} 
                             alt={tab.alt}/>

                    </button> 
                )}
            </div>
        );
    }


    let children = props.children.filter(obj => obj);
    return (
        <div className={classNames("mobile-inspector-tabbed-interface", props.className)}>
            {renderTabs()}
            <div className={classNames("mobile-inspector-tabbed-interface-body", props.bodyClassName)}>
                {children[props.tabs.map((tab) => tab.label).indexOf(selectedTab)]}
            </div>
        </div>
    )
}

