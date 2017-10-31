let BaseApplicatin = require('../lib/application/index.js');
let config = require('../config.js');

class Application extends BaseApplicatin
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

    processImage(req, res, next)
    {
        console.dir('new image!');
        res.write('New image');
        res.end();
    }
}

module.exports = Application;
