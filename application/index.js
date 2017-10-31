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
            try
            {
                sharp(path)
                    .resize(size[0], size[1])
                    .jpeg({
                        quality: 91,
                    })
                    .toBuffer()
                    .then((data) => {
                        this.setContentTypeHeader(res);
                        res.end(data);
                    })
                    .catch(() => {
                        this.send404(res);
                    });
            } catch(e) {
                this.send500(res);
            }
        }
        else
        {
            this.streamFile(path, res);
        }
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
}

module.exports = Application;
