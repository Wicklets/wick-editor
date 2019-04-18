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

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Editor from './Editor/Editor';
import * as serviceWorker from './serviceWorker';

// Testing preloading assets... (currently disabled)
/*
var queue = new window.createjs.LoadQueue();
queue.on('complete', (e) => {
  console.log('complete')
  ReactDOM.render(<Editor />, document.getElementById('root'));
}, this);
queue.on('error', (e) => {
  console.log('error')
  console.log(e);
}, this);
queue.on('progress', (e) => {
  console.log('progress')
  console.log(e)
}, this);
queue.loadManifest([
    {id: 'brush.svg', src: 'resources/toolbar-icons/brush.svg', type: window.createjs.Types.SVG},
]);
*/

ReactDOM.render(<Editor />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
