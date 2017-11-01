let BaseApplication = require('../lib/application/index.js');
let config = require('../config.js');
let _ = require('../lib/_.js');

let fs = require('fs');
let sharp = require('sharp');

class Application extends BaseApplication
{
    constructor()
    {
        super(config);
    }

    getRouteMap()
    {
        return [
            {
                path: '/:file',
                handler: this.processImage,
            },
            {
                path: '/:file/:sizeX/:sizeY',
                handler: this.processImage,
            },
        ];
    }

    processImage(req, res)
    {
        const file = req.params.file;

        if (!_.isStringNotEmpty(file))
        {
            this.send400(res);
        }

        const path = this.getFilePath(file);
        if (!_.isStringNotEmpty(path))
        {
            this.send500(res);
        }

        const size = this.extractSize(req);
        if (size)
        {
            this.streamResized(file, size, res).catch(() => {
                // not found, create and try to stream again
                try
                {
                    this.resize(file, size).then((cachedPath) => {
                        // send cached copy, if okay
                        this.streamFile(cachedPath, res);
                    }).catch((e) => {
                        console.dir(e);
                        this.send500(res);
                    });
                } catch(e) {
                    this.send500(res);
                }
            });
        }
        else
        {
            this.streamFile(path, res);
        }
    }

    streamResized(file, size, res)
    {
        return this.prepareCachePath().then(() => {
            return this.prepareCacheSubPath(file);
        }).then(() => {
            const cPath = this.getCachedFilePath(file, size);

            return new Promise((resolve, reject) => {
                const stream = fs.createReadStream(cPath);
                stream.on('error', (e) => {
                    reject(e);
                });
                stream.on('open', () => {
                    this.setCacheControlHeaders(res);
                    resolve();
                });

                stream.pipe(res);
            });
        });
    }

    resize(file, size)
    {
        const pathFrom = this.getFilePath(file);
        const pathTo = this.getCachedFilePath(file, size);

        return new Promise((resolve, reject) => {
            sharp(pathFrom).resize(size[0], size[1]).jpeg({
                quality: 91,
            }).toFile(pathTo, (err, info) => {
                if (err)
                {
                    reject(err);
                }
                else
                {
                    resolve(pathTo);
                }
            });
        });
    }

    extractSize(req)
    {
        const x = parseInt(req.params.sizeX);
        const y = parseInt(req.params.sizeY);

        if (x > 0 && y > 0)
        {
            return [x, y];
        }

        return null;
    }

    streamFile(path, res)
    {
        const stream = fs.createReadStream(path);
        stream.on('error', (e) => {
            if (e.code === 'ENOENT')
            {
                this.send404(res);
            }
            else
            {
                this.send500(res);
            }
        });
        stream.on('open', () => {
            this.setCacheControlHeaders(res);
        });

        stream.pipe(res);
    }

    getFilePath(file)
    {
        const storage = this.getStoragePath();
        if (!_.isStringNotEmpty(storage))
        {
            return '';
        }

        file = file.replace(/\.+/g, '.');

        const subFolder = file.substr(0, 3);

        return `${storage}/${subFolder}/${file}`;
    }

    getStoragePath()
    {
        return this.getSettings().storagePath || '';
    }

    getCachePath()
    {
        return this.getSettings().cachePath || '';
    }

    getCachedSubPath(file)
    {
        const storage = this.getCachePath();

        file = file.replace(/\.+/g, '.');
        const subFolder = file.substr(0, 3);

        return `${storage}/${subFolder}/`;
    }

    getCachedFilePath(file, size)
    {
        const subPath = this.getCachedSubPath(file);

        return `${subPath}/${file}_${size[0]}x${size[1]}`;
    }

    prepareCacheSubPath(file)
    {
        const path = this.getCachedSubPath(file);
        if (!_.isStringNotEmpty(path))
        {
            throw new Error();
        }

        return this.makeFolder(path).catch(x => x);
    }

    prepareCachePath()
    {
        const path = this.getCachePath();
        if (!_.isStringNotEmpty(path))
        {
            throw new Error();
        }

        return this.makeFolder(path).catch(x => x);
    }

    // fs
    // todo: move to a separate module
    makeFolder(folder)
    {
        return new Promise((resolve, reject) => {
            fs.mkdir(folder, 0o755, (err) => {
                if (err)
                {
                    reject(err);
                }
                else
                {
                    resolve();
                }
            });
        });
    }

    // static isExists(folder)
    // {
    //     return new Promise((resolve) => {
    //         fs.stat(folder, (err) => {
    //             // todo: poor check
    //             resolve(!err);
    //         });
    //     });
    // }
}

module.exports = Application;
