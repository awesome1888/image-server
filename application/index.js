let BaseApplication = require('../lib/application/index.js');
let config = require('../config.js');
let _ = require('../lib/_.js');

let fs = require('fs');

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

        // no parameters - just stream the file as-is

        // have resize parameters, then 0) check if cached (if so, read from the cache) 1) resize, 2) save in the cache, 3) read from the cache

        this.streamFile(path, res);

        // res.send(path);
        //
        // res.write('New image');
        // res.end();
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
            this.attachCacheControl(res);
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

        const subFolder = file.substr(0, 3);

        return `${storage}/${subFolder}/${file}`;
    }

    getStoragePath()
    {
        return this.getSettings().storagePath || '';
    }
}

module.exports = Application;
