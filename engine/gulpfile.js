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
      'src/view/paper-ext/Layer.erase.js',
      'src/view/paper-ext/Paper.hole.js',
      'src/view/paper-ext/Paper.OrderingUtils.js',
      'src/view/paper-ext/Paper.SelectionWidget.js',
      'src/view/paper-ext/Paper.SelectionBox.js',
      'src/view/paper-ext/Path.potrace.js',
      'src/view/paper-ext/TextItem.edit.js',
      'src/view/paper-ext/View.pressure.js',
      'src/view/paper-ext/View.gestures.js',
      'src/view/paper-ext/View.scrollToZoom.js',
      'src/view/View.js',
      'src/view/View.Project.js',
      'src/view/View.Selection.js',
      'src/view/View.Clip.js',
      'src/view/View.Button.js',
      'src/view/View.Timeline.js',
      'src/view/View.Layer.js',
      'src/view/View.Frame.js',
      'src/view/View.Path.js',
      'src/gui/GUIElement.js',
      'src/gui/Button.js',
      'src/gui/Ghost.js',
      'src/gui/Icons.js',
      'src/gui/ActionButton.js',
      'src/gui/ActionButtonsContainer.js',
      'src/gui/Breadcrumbs.js',
      'src/gui/BreadcrumbsButton.js',
      'src/gui/Frame.js',
      'src/gui/FrameEdgeGhost.js',
      'src/gui/FrameGhost.js',
      'src/gui/FramesContainer.js',
      'src/gui/FrameStrip.js',
      'src/gui/Layer.js',
      'src/gui/LayerButton.js',
      'src/gui/LayerCreateLabel.js',
      'src/gui/LayersContainer.js',
      'src/gui/NumberLine.js',
      'src/gui/OnionSkinRange.js',
      'src/gui/Playhead.js',
      'src/gui/PopupMenu.js',
      'src/gui/Project.js',
      'src/gui/Scrollbar.js',
      'src/gui/ScrollbarGrabber.js',
      'src/gui/SelectionBox.js',
      'src/gui/Timeline.js',
      'src/gui/Tooltip.js',
      'src/gui/Tween.js',
      'src/gui/TweenGhost.js',
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
