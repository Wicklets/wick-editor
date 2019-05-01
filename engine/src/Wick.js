/*
 * Copyright 2019 WICKLETS LLC
 *
 * This file is part of Wick Engine.
 *
 * Wick Engine is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Wick Engine is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * This object creates a Wick namespace for wick-engine functionality and utilities.
 */
Wick = {
    /* Major.Minor.Patch[ReleaseType] */
    version: "1.0.8a",
}

console.log("Wick Engine " + Wick.version + " is available.");

// Ensure that the Wick namespace is accessible in environments where globals are finicky (react, webpack, etc)
window.Wick = Wick;
