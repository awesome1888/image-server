import process from 'process';
import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import SugarResponse from '../sugar-response/index.js';
import Database from '../database.js';
import _ from 'underscore-mixin';
// let debug = require('debug')('node-express-gen:server');

export default class Application
{
    constructor()
    {
        this._settings = this.getConfig();
    }

    getConfig()
    {
        return {};
    }

    getRouteMap()
    {
        return [];
    }

    async launch()
    {
        await this.connectDatabase();
        this.attachMiddleware();
        await this.actBeforeCreateServer();
        this.createServer();
    }

    async shutdown()
    {
        if (this._connection)
        {
            this._connection.close();
        }
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
        const router = this.getRouter();

        this.getRouteMap().forEach((route) => {
            // todo: support only POST and only GET
            router.all(route.path, function(req, res, next){
                (route.handler).apply(this, [req, new SugarResponse(res), next]);
            }.bind(this));
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

	async actBeforeCreateServer() {
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

        const port = this.getPort();
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

    getSettings()
    {
        return this._settings || {};
    }

    isDevelopment()
    {
        return this.getExpress().get('env') === 'development';
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

    async connectDatabase()
    {
        if (_.isObjectNotEmpty(this.getDBSettings()))
        {
            this._connection = new Database(this);
            await this._connection.connect();
        }
        else
        {
            this._connection = null;
        }
    }

    getEnv()
    {
        return process.env || {};
    }

    getRootUrl()
    {
        return this.getEnv().ROOT_URL || this.getSettings().rootURL || '';
    }

    getPort()
    {
        return this.getEnv().PORT || this.getSettings().port || 3000;
    }

    getDBSettings()
    {
        return this.getSettings().database || {};
    }

    getSettings()
    {
        return this._settings;
    }
}

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
