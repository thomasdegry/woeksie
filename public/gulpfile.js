var gulp = require('gulp'),
    gutil = require('gulp-util'),
    concat = require('gulp-concat'),
    compass = require('gulp-compass'),
    rename = require('gulp-rename');

gulp.task('styles', function () {
    gulp.src('./scss/style.scss')
        .pipe(compass({
            style: 'expanded',
            css: './css',
            sass: './scss',
            image: './img',
            javascript: './js',
            font: './fonts'
        }))
        .pipe(gulp.dest('./css'));
});

gulp.task('default', ['styles'], function () {
    gulp.watch(['./scss/**/*.scss', './scss/*.scss'], ['styles']);
});
