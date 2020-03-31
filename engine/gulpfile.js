var fs = require('fs');
var gulp = require('gulp');
var babel = require("gulp-babel");
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var header = require('gulp-header');
var mergeStream = require('merge-stream');

gulp.task("default", function() {
    /* Generate build number */
    /* Year.Month.Day[micro] */
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var buildString = year + '.' + month + '.' + day;

    /* Libraries */
    var libs = gulp
        .src([
            'lib/paper.js',
            'lib/base64-arraybuffer.js',
            'lib/convert-range.js',
            'lib/croquis.js',
            'lib/currentTransform.js',
            'lib/esprima.js',
            'lib/floodfill.min.js',
            'lib/howler.js',
            'lib/invert.min.js',
            'lib/is-var-name.js',
            'lib/jquery-3.3.1.min.js',
            'lib/jquery.pressure.js',
            'lib/jquery.mousewheel.js',
            'lib/jszip.js',
            'lib/lerp.js',
            'lib/localforage.min.js',
            'lib/platform.js',
            'lib/potrace.js',
            'lib/reserved-words.js',
            'lib/roundRect.js',
            'lib/timestamp.js',
            'lib/soundcloud-waveform.js',
            'lib/Tween.js',
            'lib/uuid.js'
        ])
        .pipe(concat('libs.js'));

    /* Engine */
    var src = gulp
        .src([
            'src/Wick.js',
            'src/Clipboard.js',
            'src/Color.js',
            'src/FileCache.js',
            'src/History.js',
            'src/ObjectCache.js',
            'src/Transformation.js',
            'src/ToolSettings.js',
            'src/ObjectCache.js',
            'src/Transformation.js',
            'src/GlobalAPI.js',
            'src/export/ExportUtils.js',
            'src/export/audio/AudioTrack.js',
            'src/export/autosave/AutoSave.js',
            'src/export/wick/WickFile.js',
            'src/export/wick/WickFile.Alpha.js',
            'src/export/wickobj/WickObjectFile.js',
            'src/export/svg/SVGFile.js',
            'src/export/html/HTMLExport.js',
            'src/export/html/HTMLPreview.js',
            'src/export/image/ImageSequence.js',
            'src/export/zip/ZIPExport.js',
            'src/base/Base.js',
            'src/base/Layer.js',
            'src/base/Project.js',
            'src/base/Selection.js',
            'src/base/Timeline.js',
            'src/base/Tween.js',
            'src/base/Path.js',
            'src/base/asset/Asset.js',
            'src/base/asset/FileAsset.js',
            'src/base/asset/FontAsset.js',
            'src/base/asset/ImageAsset.js',
            'src/base/asset/ClipAsset.js',
            'src/base/asset/SoundAsset.js',
            'src/base/asset/SVGAsset.js',
            'src/base/Tickable.js',
            'src/base/Frame.js',
            'src/base/Clip.js',
            'src/base/Button.js',
            'src/tools/Tool.js',
            'src/tools/Brush.js',
            'src/tools/Cursor.js',
            'src/tools/Ellipse.js',
            'src/tools/Eraser.js',
            'src/tools/Eyedropper.js',
            'src/tools/FillBucket.js',
            'src/tools/Interact.js',
            'src/tools/Line.js',
            'src/tools/None.js',
            'src/tools/Pan.js',
            'src/tools/PathCursor.js',
            'src/tools/Pencil.js',
            'src/tools/Rectangle.js',
            'src/tools/Text.js',
            'src/tools/Zoom.js',
            'src/View/paper-ext/Layer.erase.js',
            'src/View/paper-ext/Paper.hole.js',
            'src/View/paper-ext/Paper.OrderingUtils.js',
            'src/View/paper-ext/Paper.SelectionWidget.js',
            'src/View/paper-ext/Paper.SelectionBox.js',
            'src/View/paper-ext/Path.potrace.js',
            'src/View/paper-ext/TextItem.edit.js',
            'src/View/paper-ext/View.pressure.js',
            'src/View/paper-ext/View.gestures.js',
            'src/View/paper-ext/View.scrollToZoom.js',
            'src/View/View.js',
            'src/View/View.Project.js',
            'src/View/View.Selection.js',
            'src/View/View.Clip.js',
            'src/View/View.Button.js',
            'src/View/View.Timeline.js',
            'src/View/View.Layer.js',
            'src/View/View.Frame.js',
            'src/View/View.Path.js',
            'src/GUIElement/GUIElement.js',
            'src/GUIElement/Button.js',
            'src/GUIElement/Ghost.js',
            'src/GUIElement/Icons.js',
            'src/GUIElement/ActionButton.js',
            'src/GUIElement/ActionButtonsContainer.js',
            'src/GUIElement/Breadcrumbs.js',
            'src/GUIElement/BreadcrumbsButton.js',
            'src/GUIElement/Frame.js',
            'src/GUIElement/FrameEdgeGhost.js',
            'src/GUIElement/FrameGhost.js',
            'src/GUIElement/FramesContainer.js',
            'src/GUIElement/Layer.js',
            'src/GUIElement/LayerButton.js',
            'src/GUIElement/LayerCreateLabel.js',
            'src/GUIElement/LayersContainer.js',
            'src/GUIElement/NumberLine.js',
            'src/GUIElement/OnionSkinRange.js',
            'src/GUIElement/Playhead.js',
            'src/GUIElement/PopupMenu.js',
            'src/GUIElement/Project.js',
            'src/GUIElement/Scrollbar.js',
            'src/GUIElement/ScrollbarGrabber.js',
            'src/GUIElement/SelectionBox.js',
            'src/GUIElement/Timeline.js',
            'src/GUIElement/Tooltip.js',
            'src/GUIElement/Tween.js',
            'src/GUIElement/TweenGhost.js',
        ])
        .pipe(babel())
        .pipe(concat('src.js'));

    /* Write wickengine.js */
    return mergeStream(src, libs)
        .pipe(concat('wickengine.js'))
        .pipe(header('/*Wick Engine https://github.com/Wicklets/wick-engine*/\nvar WICK_ENGINE_BUILD_VERSION = "' + buildString + '";\n'))
        .pipe(gulp.dest('dist'))
        .on('end', () => {
            /* Generate empty HTML file ready for wick projects to be injected into */
            var blankHTML = fs.readFileSync('src/export/html/project.html', 'utf8');
            var engineSRC = fs.readFileSync('dist/wickengine.js', 'utf8');
            var engineSRCSafe = engineSRC.replace(/\$/g, "$$$"); // http://forums.mozillazine.org/viewtopic.php?f=19&t=2182187
            blankHTML = blankHTML.replace('<!--INJECT_WICKENGINE_HERE-->', engineSRCSafe);
            fs.writeFileSync('dist/emptyproject.html', blankHTML);

            /* Copy ZIP export resources to dist folder */
            var zipindex = fs.readFileSync('src/export/zip/index.html', 'utf8');
            var preloadjs = fs.readFileSync('src/export/zip/preloadjs.min.js', 'utf8');
            var projecthtml = fs.readFileSync('src/export/html/project.html', 'utf8');
            fs.writeFileSync('dist/index.html', zipindex);
            fs.writeFileSync('dist/preloadjs.min.js', preloadjs);
            fs.writeFileSync('dist/project.html', projecthtml);
        });
});