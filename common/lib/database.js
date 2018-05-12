import mongoose from 'mongoose';
import _ from 'underscore-mixin';

mongoose.Promise = global.Promise;

export default class Database
{
    constructor(app) {
        this._app = app || null;
    }

    async connect()
    {
        const url = this.getUrl();

        if (!_.isStringNotEmpty(url))
        {
            throw new Error('No URL provided');
        }

        const retries = this._app.getDBSettings().connectionRetries || 3;
        const tmout = this._app.getDBSettings().connectionTimeout || 1000;

        let connection = null;
        for (let t = 0; t < retries - 1; t++) {
            try
            {
                connection = await mongoose.connect(url);
                t = retries + 1; // exit cycle

                console.dir('DB connection established');
            }
            catch(e)
            {
                await new Promise((resolve) => {
                    setTimeout(resolve, tmout);
                });
            }
        }

        if (!connection)
        {
            throw new Error('Unable to connect to the database');
        }

        this._connection = connection;
    }

    async disconnect()
    {
        this._connection.disconnect();
    }

    getUrl()
    {
        return this._app.getEnv().DB_URL || this._app.getDBSettings().url || '';
    }
}
