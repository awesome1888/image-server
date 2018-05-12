const gulp = require('gulp');
const Gulp = require('./gulp/gulp-tasks.js');

Gulp.makeTasks(gulp);

gulp.task('build', [
    Gulp.getCompileTaskName(),
]);

gulp.task('default', [
    Gulp.getMainTaskName(),
]);
