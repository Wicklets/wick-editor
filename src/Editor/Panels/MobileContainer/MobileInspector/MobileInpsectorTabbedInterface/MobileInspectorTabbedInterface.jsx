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

import React, { Component } from 'react';

import './_mobileinspectortabbedinterface.scss';

var classNames = require('classnames'); 

class MobileInspectorTabbedInterface extends Component {
    /**
     * @param {} props Expects several props.
     * - tabs {Object[]} Contains all tab information for the interface
     * 
     * tab {Object}
     * - name {String} String name of the tab. Will be displayed in the tab interface.
     * - body {JSX Object} Object to render
     * - icon
     * - iconActive
     * - iconAlt
     */

    // example prop:
    // <MobileTabbedInterface tabs={[{label: "transform", icon: transformIcon, iconActive: transformIconActive, iconAlt: "transform icon"}]} >
    constructor (props) {
        super(props);

        this.state = {
          selectedTab: this.props.tabs[0].label,
        }
    }

    // Selects the tab of the given name.
    selectTab = (label) => {
        this.setState({
            selectedTab: label,
        });

        if (this.props.onTabSelect) {
            this.props.onTabSelect(label);
        }
    }

    /**
     * Renders the selectable tab bar.
     */
    renderTabs = () => {
        return (
            <div role="tablist" className="mobile-inspector-tabbed-interface-main-tab-container">
                {this.props.tabs.map( (tab, i) => 
                    <button
                    key={`tab-${tab.label}-${i}`}
                    className={classNames("mobile-inspector-tabbed-interface-main-tab", 
                                          "mobile-inspector-"+tab.label+"-tab", 
                                          this.props.tabClassName, 
                                          {"selected": (this.state.selectedTab === tab.label)})}
                    onClick={() => {this.selectTab(tab.label)}}>
                        <img className={classNames("mobile-inspector-tabbed-interface-icon",
                                        "mobile-inspector-"+tab.label+"-tab-icon")}
                             src={this.state.selectedTab === tab.label ? tab.iconActive : tab.icon} alt={tab.alt}></img>
                    </button> 
                )}
            </div>
        );
    }

    render() {
        let children = this.props.children.filter(obj => obj);
        return (
            <div className={classNames("mobile-inspector-tabbed-interface", this.props.className)}>
                {this.renderTabs()}
                <div className={classNames("mobile-inspector-tabbed-interface-body", this.props.bodyClassName)}>
                    {children[this.props.tabs.map((tab) => tab.label).indexOf(this.state.selectedTab)]}
                </div>
            </div>
        ); 
    }
}

export default MobileInspectorTabbedInterface