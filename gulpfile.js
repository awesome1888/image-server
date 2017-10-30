// const gulp = require('gulp');
// const clean = require('gulp-clean');
// const babel = require('gulp-babel');
// const path = require('path');
// const plumber = require('gulp-plumber');

var gulp = require('gulp'),
    spawn = require('child_process').spawn,
    node;

/**
 * $ gulp server
 * description: launch the server. If there's a server already running, kill it.
 */
gulp.task('server', function() {
    if (node) node.kill();
    node = spawn('node', ['index.js'], {stdio: 'inherit'});
    node.on('close', function (code) {
        if (code === 8) {
            gulp.log('Error detected, waiting for changes...');
        }
    });
});

/**
 * $ gulp
 * description: start the development environment
 */
gulp.task('default', function() {
    gulp.run('server');

    gulp.watch(['./index.js', './application/**/*.js'], function() {
        gulp.run('server');
    });

    // Need to watch for sass changes too? Just add another watch call!
    // no more messing around with grunt-concurrent or the like. Gulp is
    // async by default.
});

// clean up if an error goes unhandled.
process.on('exit', function() {
    if (node) node.kill();
});

// gulp.task('clean', function() {
//     return gulp.src('dest', {read: false})
//         .pipe(clean());
// });
//
// gulp.task('compileEs6', ['clean'], function() {
//     return gulp.src('src/**/*.es6')
//         .pipe(plumber())
//         .pipe(babel({
//             presets: ['es2015']
//         }))
//         .pipe(gulp.dest('dest'));
// });
//
// gulp.task('copyJs', ['clean'], function() {
//     return gulp.src([
//         'src/**/*.js',
//         'node_modules/jquery/dist/jquery.slim.js'
//     ]).pipe(gulp.dest('dest'));
// });

//
// gulp.task('watch', function() {
//     gulp.watch('src/**/*', ['build']);
// });
//
// gulp.task('build', ['compileEs6', 'copyJs', 'compileLess', 'copyCss']);
// gulp.task('default', ['build', 'watch']);