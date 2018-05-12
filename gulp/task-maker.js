const clean = require('gulp-clean');
const babel = require('gulp-babel');
const plumber = require('gulp-plumber');
const vfs = require('vinyl-fs');
const GulpDockerCompose = require('gulp-docker-compose').GulpDockerCompose;

module.exports = class TaskMaker
{
    static getServiceName()
    {
        throw new Error('Not implemented .getServiceName()');
    }

    static getFolder()
    {
        throw new Error('Not implemented .getFolder()');
    }

    static getPrefix()
    {
        return `${this.getServiceName()}-`;
    }

    static getCleanTaskName()
    {
        return `${this.getPrefix()}clean`;
    }

    static getCompileTaskName()
    {
        return `${this.getPrefix()}compile`;
    }

    static getRunTaskName()
    {
        return `${this.getPrefix()}run`;
    }

    static getRestartTaskName()
    {
        return `${this.getPrefix()}restart`;
    }

    static getWatchTaskName()
    {
        return `${this.getPrefix()}watch`;
    }

    static getMainTaskName()
    {
        return `${this.getPrefix()}main`;
    }

    static makeTasks(gulp)
    {
        const folder = this.getFolder();

        const srcFolder = `${folder}/src/`;
        const dstFolder = `${folder}/build/`;

        // clean the previous server build
        gulp.task(this.getCleanTaskName(), function() {
            return gulp.src(dstFolder, {read: false})
                .pipe(clean({force: true}));
        });

        // compile server js
        gulp.task(this.getCompileTaskName(), [this.getCleanTaskName()], () => {
            // vfs follows symlinks
            return vfs.src(srcFolder+'/**/*.js')
                .pipe(plumber())
                .pipe(babel({
                    presets: [
                        ["env", {
                            "targets": {
                                "node": "4"
                            },
                            "modules": "commonjs",
                        }],
                    ]
                }))
                .pipe(vfs.dest(dstFolder));
        });

        // watch src/
        gulp.task(this.getWatchTaskName(), () => {
            gulp.watch([`${srcFolder}/**/*`], [this.getCompileTaskName(), this.getRestartTaskName()]);
        });

        // orchestrate
        new GulpDockerCompose(gulp, {
            tasks: {
                run: {
                    name: this.getRunTaskName(),
                    dependences: [this.getCompileTaskName()],
                },
                restart: {
                    name: this.getRestartTaskName(),
                    dependences: [this.getCompileTaskName()],
                },
            },
            // extraArgs: {
            //     upOnRun: '--scale bot-app=3',
            //     upOnYMLChange: '--scale bot-app=3',
            // },
            exposeCLICommands: true,
            hangOnInt: false,
        });

        // main task
        gulp.task(this.getMainTaskName(), [this.getCompileTaskName(), this.getRunTaskName(), this.getWatchTaskName()]);
    }
};
