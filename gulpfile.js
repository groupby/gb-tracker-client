const gulp     = require('gulp');
const mocha    = require('gulp-mocha');
const eslint   = require('gulp-eslint');
const istanbul = require('gulp-istanbul');
const gulpIf   = require('gulp-if');

const path          = require('path');
const webpack       = require('webpack');
const webpackStream = require('webpack-stream');
const packageJson   = require('./package.json');
const webpackConfig = require('./webpack.config');
const exec          = require('gulp-exec');

gulp.task('build:minify', () => {
  const minConfig = Object.assign({}, webpackConfig, {
    output:  {filename: packageJson.name + '-' + packageJson.version + '.min.js'},
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ]
  });

  return gulp.src(['lib/gb-tracker-window.js'])
    .pipe(webpackStream(minConfig))
    .pipe(gulp.dest('dist'));
});

gulp.task('build:normal', () => gulp.src(['lib/gb-tracker-window.js'])
  .pipe(webpackStream(webpackConfig))
  .pipe(gulp.dest('dist')));

gulp.task('build', [
  'build:normal',
  'build:minify'
]);

const isFixed = (file) => {
  // Has ESLint fixed the file contents?
  return file.eslint != null && file.eslint.fixed;
};


gulp.task('test:dirty', () => {
  return gulp.src('tests/**/*.spec.js')
    .pipe(mocha({reporter: 'spec'}));
});

gulp.task('pre-test', ['build'], () => {
  return gulp.src([
    'lib/gb-tracker-core.js',
    'lib/utils.js'
  ])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});

gulp.task('test:coverage', ['pre-test'], () => {
  return gulp.src(['tests/**/*.spec.js'])
    .pipe(mocha({reporter: 'spec'}))
    .pipe(istanbul.writeReports({
      reporters: [
        'text',
        'html',
        'lcov'
      ]
    }))
    .once('error', () => {
      console.error('coverage failed');
      process.exit(1);
    });
});

const lint = () => {
  return gulp.src([
    'lib/gb-tracker-core.js',
    'lib/utils.js',
    'tests/**/*.js'
  ], {base: './'})
    .pipe(eslint({
      fix: true
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(gulpIf(isFixed, gulp.dest('./')))
    .once('error', () => {
      console.error('lint failed');
      process.exit(1);
    })
};

gulp.task('test:lint', ['test:coverage'], () => {
  return lint();
});

gulp.task('lint', () => {
  return lint();
});

gulp.task('test', ['test:lint']);