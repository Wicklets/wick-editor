cd /D "%~dp0"
cd engine
gulp && copy /b/v/y "dist\wickengine.js" "..\public\corelibs\wick-engine\wickengine.js"