const gulp = require('gulp');
const GulpDockerCompose = require('gulp-docker-compose').GulpDockerCompose;

const Backend = require('./app/backend/gulp/gulp-tasks.js');

Backend.makeTasks(gulp);

// watch docker-compose.yml
new GulpDockerCompose(gulp, {
    tasks: {
        watchYML: {
            name: 'watch-yml',
        },
    },
    // extraArgs: {
    //     upOnYMLChange: '--scale bot-app=3',
    // },
    exposeCLICommands: true,
    projectFolder: __dirname,
	dockerComposeFileName: `${__dirname}/docker/development.yml`,
});

gulp.task('default', [
    'watch-yml',
    Backend.getMainTaskName(),
    // Manager.getMainTaskName(),
]);
