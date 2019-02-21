cd wick-engine;
gulp;
cp dist/wickengine.js ../public/corelibs/wick-engine/wickengine.js;
cd ../paper.js-drawing-tools;
gulp;
cp src/paper-ext/Paper.Selection.js ../wick-engine/lib/Paper.Selection.js;
cp dist/paperjs-drawing-tools.js ../public/corelibs/paper-drawing-tools/paperjs-drawing-tools.js
