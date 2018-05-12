import fs from 'fs';

// to make babel-ed async functions work in nodejs 4.x or prior to
// todo: prepend it automatically on build
const regeneratorRuntime = require("regenerator-runtime");

export default class FSHelper
{
    static async isExists(folder)
    {
        return new Promise((resolve) => {
            fs.stat(folder, (err) => {
                // todo: poor check
                resolve(!err);
            });
        });
    }

    static async unlink(file)
    {
        return new Promise((resolve, reject) => {
            fs.unlink(file, (err) => {
                if (err)
                {
                    reject(err);
                }
                else
                {
                    resolve(true);
                }
            });
        });
    }

    static async maybeMakeFolder(folder)
    {
        const exists = await this.isExists(folder);
        if (exists)
        {
            return true;
        }

        return new Promise((resolve, reject) => {
            fs.mkdir(folder, 0o755, (err) => {
                if (err)
                {
                    reject(err);
                }
                else
                {
                    resolve(true);
                }
            });
        });
    }

    static secureName(name)
    {
        return name.replace(/\.+/g, '.');
    }
}