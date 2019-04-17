/*
 * Copyright 2018 WICKLETS LLC
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

paper.View.inject({
  pressure: 1,
  enablePressure: function(args) {
    let self = this;
    let MIN_PRESSURE = 0.14;

    $(this.element.parentElement).pressure({
      change: function(force, event) {
        self.pressure = $.pressureMap(force, 0.0, 1.0, MIN_PRESSURE, 1.0);
      },
      end: function() {
        self.pressure = 1.0;
      }
    }, {polyfill: false})
  },
});
