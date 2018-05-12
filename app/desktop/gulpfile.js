const gulp = require('gulp');
const clean = require('gulp-clean');
const babel = require('gulp-babel');
const less = require('gulp-less');
const path = require('path');
const plumber = require('gulp-plumber');
const spawn = require('child_process').spawn;
const vfs = require('vinyl-fs');

const srcFolder = './app/';
const dstFolder = 'build/';

let node = null;

///////////////////
// App/Desktop

// const srcFolderClient = srcFolder+'client';
// const dstFolderClient = dstFolder+'client';

// // clean the previous client build
// gulp.task('cleanClient', function() {
//     return gulp.src(dstFolderClient, {read: false})
//         .pipe(clean());
// });
//
// // compile client js (js)
// gulp.task('compileEs6Client', ['cleanClient'], function() {
//     // vfs follows symlinks
//     return vfs.src(srcFolderClient+'/**/*.js')
//         .pipe(plumber())
//         .pipe(babel({
//             presets: [
//                 ["env", {
//                     "targets": {
//                         "browsers": ["last 2 versions", "safari >= 7"]
//                     },
//                     "modules": "amd",
//                 }]
//             ]
//         }))
//         .pipe(vfs.dest(dstFolderClient));
// });
//
// // compile less
// gulp.task('compileLessClient', ['cleanClient'], function () {
//     return gulp.src(srcFolderClient+'/css/**/*.less')
//         .pipe(plumber())
//         .pipe(less({
//             paths: [ path.join(__dirname, 'less', 'includes') ]
//         }))
//         .pipe(gulp.dest(dstFolderClient+'/css'));
// });
//
// // copy css
// // gulp.task('copyCss', ['clean'], function() {
// //     return gulp.src([
// //         'node_modules/bootstrap/dist/**/*.css',
// //     ]).pipe(gulp.dest('dest'));
// // });

const srcFolderBackend = srcFolder+'backend';
const dstFolderBackend = dstFolder+'backend';

// clean the previous server build
gulp.task('cleanBackend', function() {
    return gulp.src(dstFolderBackend, {read: false})
        .pipe(clean());
});

// run the server
gulp.task('serve', ['buildBackend'], function() {
    if (node) node.kill();
    node = spawn('node', [dstFolderBackend+'/index.js'], {stdio: 'inherit'});
    node.on('close', function (code) {
        if (code === 8)
        {
            gulp.log('Error detected, waiting for changes...');
        }
    });
});

///////////////////
// Root tasks

gulp.task('watch', function() {
    // gulp.watch([srcFolderClient+'/**/*'], ['buildClient']);
    gulp.watch([srcFolderBackend+'/**/*'], ['buildBackend', 'serve']);
});
// gulp.task('buildDesktop', ['compileEs6Desktop', 'compileLessDesktop', /*'copyCss'*/]);
gulp.task('buildBackend', ['compileEs6Backend',]);
gulp.task('default', [/*'buildDesktop',*/ 'buildBackend', 'watch', 'serve']);
