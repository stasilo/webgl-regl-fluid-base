var options = {
    jsEntryPoint: 'scripts/app.js',
    jsBundlePath: 'dist',
    jsBundleName: 'bundle',

    scssEntryPoint: 'styles/site.scss',
    scssWatchPath: 'styles/**/*.scss',
    scssIncludePath: ['styles/**'],
    scssDistPath: 'styles/dist',

    autoprefixer: {
        browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
    },

    // set a variable telling us if we're building in release/prod or dev
    isProduction: process.env.NODE_ENV && process.env.NODE_ENV === 'Release' ? true : false
};

var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');
var uglify = require("gulp-uglify");
var noop = require('gulp-noop');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var clean = require('gulp-clean');
var stringify = require('stringify');
var glslify = require('glslify');
var server = require('gulp-server-livereload');

var babelify = babel.configure({
    presets: ["es2015", "stage-0", "es2017"],
    plugins: ["transform-object-rest-spread", "transform-es2015-parameters", "transform-runtime", "add-module-exports"]
});

function transpileAndBundleJs(watch) {
    var b = browserify(options.jsEntryPoint, { debug: true })
        .transform(glslify)
        .transform(babelify);

        // .transform(stringify, {
        //     appliesTo: { includeExtensions: ['.vertex', '.fragment', '.glsl'] },
        //     minify: false
        // });

    var bundler = watch ? watchify(b) : b;

    function bundle() {
        console.log('[' + new Date().toTimeString() + '] hack.gl -> Transpiling and bundling js assets...');

        bundler.bundle()
            .on('error', function(err) { console.error(err); this.emit('end'); })
            .pipe(source(options.jsBundleName + '.js'))
            .pipe(buffer())
            .pipe(options.isProduction ? noop() : sourcemaps.init({ loadMaps: true }))
            .pipe(options.isProduction ? uglify() : noop())
            .on('error', function (err) { console.error(err); this.emit('end'); })
            .pipe(options.isProduction ? noop() : sourcemaps.write('./'))
            .pipe(gulp.dest(options.jsBundlePath));
    }

    if (watch) {
        bundler.on('update', function() {
            bundle();
        });
    }

    bundle();
}

function watchJs() {
    return transpileAndBundleJs(true);
};

gulp.task('sass', function () {
    console.log('[' + new Date().toTimeString() + '] hack.gl -> Transpiling and bundling scss assets...');

    return gulp
        .src(options.scssEntryPoint)
        .pipe(options.isProduction ? noop() : sourcemaps.init())
        .pipe(sass({
            errLogToConsole: true,
            outputStyle: options.isProduction ? 'compressed' : 'expanded',
            includePaths: options.scssIncludePath
        }))
        .on('error', function (err) { console.error(err); this.emit('end'); })
        .pipe(autoprefixer(options.autoprefixer))
        .pipe(options.isProduction ? noop() : sourcemaps.write('./'))
        .pipe(gulp.dest(options.scssDistPath));
});

gulp.task('clean-scripts', function () {
    return gulp
        .src(options.jsBundlePath, { read: false })
        .pipe(clean());
});

gulp.task('clean-css', function () {
    return gulp
        .src(options.scssDistPath, { read: false })
        .pipe(clean());
});

gulp.task('build', ['clean-scripts', 'clean-css'], function () {
    console.log('hack.gl -> Building assets for ' + (options.isProduction ? '[PRODUCTION]' : '[DEVELOPMENT]'));

    gulp.start('sass');
    return transpileAndBundleJs(false);
});

gulp.task('watch', ['build'], function () {
    gulp.watch(options.scssWatchPath, ['sass']);
    return watchJs();
});

gulp.task('webserver', ['watch'], function () {
  gulp.src('.')
    .pipe(server({
      livereload: {
        enable: true,
        filter: function (filename, cb) {
          cb(!/\.(sa|le)ss$|node_modules/.test(filename));
        },
        defaultFile: 'index.html'
      },
      directoryListing: false,
      open: true
    }));
});

gulp.task('default', ['build']);
