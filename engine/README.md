# Wick Engine

This is the official implementation of the Wick Engine. The engine contains all of the core logic for how timelines, scripts, clips, the tick system, tweens etc. work in Wick.

# How to Build

You will need the following things installed:

- [npm](https://www.npmjs.com/)

1. Make sure you `cd` into the `wick-engine` directory.
2. Install [gulp](https://gulpjs.com/): `npm install -g gulp`
3. Install other dependencies for the build process: `npm install`
4. Build the engine!: `gulp`

This will create `dist/wickengine.js`.

# Generate Docs

Generating the docs also requires [npm](https://www.npmjs.com/).

1. Install dependencies for the build process: `npm install`
2. Build the docs with: `npm run generate-docs`

# Running Tests

The Wick Engine uses the in-browser version of Mocha and Chai for tests. To run the tests, just open `tests/index.html` in the browser you wish to test with.

# License

Wick Editor is Licensed under the GPL v3. A copy of the GPL v3 is distributed with the Wick Engine. If a copy of the license has not been provided, see <https://www.gnu.org/licenses/>.
