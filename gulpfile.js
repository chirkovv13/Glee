const { src, dest, watch, parallel, series } = require('gulp');

const fileinclude = require('gulp-file-include');
const scss = require('gulp-sass');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const autoprefixer = require('gulp-autoprefixer');
const svgSprite = require('gulp-svg-sprite');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const del = require('del');
const imagemin = require('gulp-imagemin');
const gulpStylelint = require('gulp-stylelint');




function htmlInclude() {
  return src(['app/index.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(dest('.'));
}

 

function styles() {
  return src('app/scss/style.scss')
    .pipe(sourcemaps.init())
    .pipe(scss({outputStyle: 'compressed'}))
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'],
      grid: true
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
}


function scripts() {
  return src([
    'node_modules/jquery/dist/jquery.js',
    'node_modules/slick-carousel/slick/slick.js',
    'node_modules/mixitup/dist/mixitup.js',
    'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.js',
    'app/js/main.js'
  ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}



function svgSprites() {
  return src('app/images/icons/*.svg')
    .pipe(svgSprite({
            mode: {
              stack: {
                sprite: "../sprite.svg"
              }
            }
          }))
    .pipe(dest('app/images'))
}



function browsersync() {
  browserSync.init({
    server: {
      baseDir: 'app/'
    },
    notify: false
  })
}



function cleanDist() {
  return del('dist')
}



function images() {
  return src('app/images/**/*.*')
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.mozjpeg({quality: 75, progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
          plugins: [
              {removeViewBox: true},
              {cleanupIDs: false}
          ]
      })
    ]))
    .pipe(dest('dist/images'))
}



function lintCss() {
  return src('app/scss/**/*.scss')
    .pipe(gulpStylelint ({
      reporters: [
        {
          formatter: 'string',
          console: true
        }
      ]
    }));
}



function build() {
  return src([
    'app/**/*.html',
    'app/css/style.min.css',
    'app/js/main.min.js'
  ], {base: 'app'})
    .pipe(dest('dist'))
}



function watching() {
  watch(['app/**/*.html']).on('change', browserSync.reload);
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
  watch(['app/images/icons/*.svg'], svgSprites);
}



exports.fileinclude = htmlInclude;
exports.styles = styles;
exports.scripts = scripts;
exports.svgSprite = svgSprites;
exports.browsersync = browsersync;
exports.watching = watching;
exports.cleanDist = cleanDist;
exports.images = images;
exports.lintCss = lintCss;

exports.build = series(cleanDist, images, build);

exports.default = parallel(htmlInclude, styles, scripts, svgSprites, browsersync, watching);