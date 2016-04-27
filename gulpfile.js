var gulp        = require('gulp'),
    concat      = require('gulp-concat'),
    minifyCss   = require('gulp-minify-css'),
    uglify      = require('gulp-uglify');
var config      = require('./gulp.config')();


// css bundle
gulp.task('css', function() {
    return gulp
        .src(config.cssAssets)
        .pipe(minifyCss())
        .pipe(concat('app.css'))
        .pipe(gulp.dest(config.cssDist));
})


// js bundle
gulp.task('js', function() {
    return gulp
        .src(config.jsFiles)
        .pipe(uglify())
        .pipe(concat('app.js'))
        .pipe(gulp.dest(config.jsDist));
});


// DEFAULT
gulp.task('default', [
    'css', 'js'
]);
