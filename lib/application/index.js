let http = require('http');
let express = require('express');
let bodyParser = require('body-parser');
// let _ = require('underscore');
// let debug = require('debug')('node-express-gen:server');

class Application
{
    // _settings = null;
    // _server = null;

    constructor(settings)
    {
        this._settings = settings || {};
    }

    getRouteMap()
    {
        return [];
    }

    launch()
    {
        this.attachMiddleware();
        this.createServer();
    }

    attachMiddleware()
    {
        const ex = this.getExpress();
        
        ex.use(bodyParser.json());
        ex.use(bodyParser.urlencoded({
            extended: false,
        }));

        // ex.use(logger('dev'));
        // ex.use(passport.initialize());
        // ex.use(express.static(path.join(__dirname, 'public')));
        
        this.attachRoutes();
        this.attach404();
    }

    attachRoutes()
    {
        const routes = this.getRouteMap();
        const router = this.getRouter();

        this.getRouteMap().forEach((route) => {
            // todo: support POST and possibly other
            router.all(route.path, route.handler.bind(this));
        });
        
        this.getExpress().use('/', router);
    }

    attach404()
    {
        this.getExpress().use((req, res, next) => {
            if (this.isDevelopment())
            {
                let err = new Error('Not Found');
                err.status = 404;
                next(err);
            }
            else
            {
                this.send404(res);
            }
        });
    }

    createServer()
    {
        const e = this.getExpress();

        let port = this.getPort();
        e.set('port', port);

        let server = http.createServer(e);

        server.listen(port);
        server.on('error', this.onError.bind(this));
        server.on('listening', this.onListening.bind(this));

        this._server = server;
    }

    getServer()
    {
        return this._server;
    }

    getExpress()
    {
        if (!this._express)
        {
            this._express = express();
            this._express.disable('x-powered-by'); // decrease the level of pathos
        }

        return this._express;
    }

    getRouter()
    {
        return express.Router();
    }

    onError(error)
    {
        if (error.syscall !== 'listen')
        {
            throw error;
        }

        let bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

        // handle specific listen errors with friendly messages
        switch (error.code)
        {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    onListening()
    {
        let addr = this.getServer().address();
        let bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        console.dir('Listening on ' + bind);
    }

    getPort()
    {
        return this.getSettings().port || 3012;
    }

    getCacheTime()
    {
        return this.getSettings().cacheTime || 0;
    }

    getSettings()
    {
        return this._settings || {};
    }

    isDevelopment()
    {
        return this.getExpress().get('env') === 'development';
    }

    setCacheControlHeaders(res)
    {
        const ct = this.getCacheTime();
        if (ct > 0)
        {
            res.setHeader('Cache-Control', `max-age=${ct}`);
        }
    }

    setContentTypeHeader(res, type = 'image/jpg')
    {
        res.setHeader('Content-Type', type);
    }

    send404(res)
    {
        res.status(404);
        res.end('Not found');
    }

    send400(res)
    {
        res.status(400);
        res.end('Bad request');
    }

    send500(res)
    {
        res.status(500);
        res.end('Internal server error');
    }
}

module.exports = Application;

// error handlers

// development error handler
// will print stacktrace
// if (app.get('env') === 'development') {
//     app.use(function(err, req, res, next) {
//         res.status(err.status || 500);
//         res.json({
//             message: err.message,
//             error: err
//         });
//     });
// }

// production error handler
// no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.json({
//         message: err.message,
//         error: {}
//     });
// });
