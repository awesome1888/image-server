const gulp = require('gulp');
const clean = require('gulp-clean');
const babel = require('gulp-babel');
const plumber = require('gulp-plumber');
const vfs = require('vinyl-fs');

const srcFolder = './';
const srcFolderServer = srcFolder+'app';

const dstFolder = 'build/';
const dstFolderServer = dstFolder+'app';

///////////////////
// Server

// clean the previous server build
gulp.task('cleanServer', function() {
    return gulp.src(dstFolderServer, {read: false})
        .pipe(clean());
});

// compile server js
gulp.task('compileEs6Server', ['cleanServer'], function() {
    // vfs follows symlinks
    return vfs.src(srcFolderServer+'/**/*.js')
        .pipe(plumber())
        .pipe(babel({
            presets: [
                ["env", {
                    "targets": {
                        "node": "6.10"
                    },
                    "modules": "commonjs",
                }],
            ]
        }))
        .pipe(vfs.dest(dstFolderServer));
});

// // copy the other client js (plain)
// gulp.task('copyJsServer', ['cleanServer'], function() {
//     // vfs follows symlinks
//     return vfs.src(srcFolderServer+'/**/*.js').pipe(vfs.dest(dstFolderServer));
// });

///////////////////
// Root tasks

gulp.task('watch', function() {
    gulp.watch([srcFolderServer+'/**/*'], ['buildServer']);
});
gulp.task('buildServer', ['compileEs6Server']);
gulp.task('default', ['buildServer', 'watch']);