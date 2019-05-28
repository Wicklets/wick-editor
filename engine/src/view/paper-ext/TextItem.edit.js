/*
 * Copyright 2019 WICKLETS LLC
 *
 * This file is part of Paper.js-drawing-tools.
 *
 * Paper.js-drawing-tools is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Paper.js-drawing-tools is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Paper.js-drawing-tools.  If not, see <https://www.gnu.org/licenses/>.
 */

(function () {
    var editElem = $('<textarea style="resize: none;">');
    editElem.css('position', 'absolute');
    editElem.css('overflow', 'hidden');
    editElem.css('width', '100px');
    editElem.css('height', '100px');
    editElem.css('left', '0px');
    editElem.css('top', '0px');
    editElem.css('resize', 'none');
    editElem.css('line-height', '1.2');
    editElem.css('background-color', '#ffffff');
    editElem.css('box-sizing', 'content-box');
    editElem.css('-moz-box-sizing', 'content-box');
    editElem.css('-webkit-box-sizing', 'content-box');
    editElem.css('border', 'none');

    paper.TextItem.inject({
        attachTextArea: function (paper) {
            $(paper.view.element.offsetParent).append(editElem);
            editElem.focus();

            var clone = this.clone();
            clone.rotation = 0;
            clone.scaling = new paper.Point(1,1);
            clone.remove();

            var width = clone.bounds.width * paper.view.zoom;
            var height = clone.bounds.height * paper.view.zoom;
            editElem.css('width', width+'px');
            editElem.css('height', height+'px');

            editElem.css('outline', (1*paper.view.zoom)+'px dashed black');

            var position = paper.view.projectToView(clone.bounds.topLeft.x, clone.bounds.topLeft.y);
            var scale = this.scaling;
            var rotation = this.rotation;

            var fontSize = this.fontSize * paper.view.zoom;
            var fontFamily = this.fontFamily;
            var content = this.content;
            editElem.css('font-family', fontFamily);
            editElem.css('font-size', fontSize);
            editElem.val(content);

            var transformString = '';
            transformString += 'translate('+position.x+'px,'+position.y+'px) ';
            transformString += 'rotate('+rotation+'deg) ';
            transformString += 'scale('+scale.x+','+scale.y+') ';
            editElem.css('transform', transformString);
        },
        edit: function(paper) {
            this.attachTextArea(paper);
            var self = this;
            editElem[0].oninput = function () {
                self.content = editElem[0].value;
                self.attachTextArea(paper);
            }
        },
        finishEditing: function() {
            editElem.remove();
        },
    });

})()
