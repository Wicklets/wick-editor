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

import './_tabbedinterface.scss';

var classNames = require('classnames'); 

class TabbedInterface extends Component {
    /**
     * @param {} props Expects several props.
     * - tabs {Object[]} Contains all tab information for the interface
     * 
     * tab {Object}
     * - name {String} String name of the tab. Will be displayed in the tab interface.
     * - body {JSX Object} Object to render
     */
    constructor (props) {
        super(props);

        this.state = {
          selectedTab: this.props.tabNames[0],
        }
    }

    // Selects the tab of the given name.
    selectTab = (name) => {
        this.setState({
            selectedTab: name,
        });

        if (this.props.onTabSelect) {
            this.props.onTabSelect(name);
        }
    }

    /**
     * Renders the selectable tab bar.
     */
    renderTabs = () => {
        return (
            <div role="tablist" className="tabbed-interface-main-tab-container">
                {this.props.tabNames.map( (tab, i) => 
                    <button
                    key={`tab-${tab}-${i}`}
                    className={classNames("tabbed-interface-main-tab", this.props.tabClassName, {"selected": (this.state.selectedTab === tab)})}
                    onClick={() => {this.selectTab(tab)}}>
                        {tab}
                </button> 
                )}
            </div>
        );
    }

    render() {
        return (
            <div className={classNames("tabbed-interface", this.props.className)}>
                {this.renderTabs()}
                <div className={classNames("tabbed-interface-body", this.props.bodyClassName)}>
                    {this.props.children[this.props.tabNames.indexOf(this.state.selectedTab)]}
                </div>
            </div>
        ); 
    }
}

export default TabbedInterface