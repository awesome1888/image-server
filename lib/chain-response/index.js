import {ServerResponse} from 'http';
import fs from 'fs';

export default class ChainResponse
{
    _r = null;
    _headersSent = false;

    constructor(res)
    {
        if (!(res instanceof ServerResponse))
        {
            throw new TypeError('Argument is not a ServerResponse');
        }

        this._r = res;
        this._headersSent = res._headersSent;
    }

    /**
     * @param source String|ReadableStream
     * @param options
     */
    async streamFile(source, options = {})
    {
        options = options || {};

        const onBeforeOpen = options.onBeforeOpen || null;

        let setLength = true;
        if ('setLength' in options)
        {
            setLength = !!options.setLength;
        }

        let asAttachment = false;
        if ('asAttachment' in options)
        {
            asAttachment = !!options.asAttachment;
        }

        return new Promise((resolve, reject) => {
            const doStream = () => {
                const stream = fs.createReadStream(source);
                stream.on('error', (e) => {
                    // if (e.code === 'ENOENT')
                    // {
                    //     this.s404();
                    // }
                    // else
                    // {
                    //     this.s500();
                    // }
                    //
                    reject({self: this, e});
                });
                stream.on('end', () => {
                    resolve({self: this});
                });
                stream.on('open', () => {
                    if (asAttachment)
                    {
                        // todo: extract file name here
                        this.asAttachment();
                    }

                    if (_.isFunction(onBeforeOpen))
                    {
                        onBeforeOpen(this);
                    }
                });

                stream.pipe(this._r);
            };

            if (setLength)
            {
                // find out the length first
                fs.stat(source, (err, stat) => {
                    if (err)
                    {
                        reject({self: this, e});
                    }
                    else
                    {
                        this.contentLength(stat.size);
                        doStream();
                    }
                });
            }
            else
            {
                doStream();
            }
        });
    }

    contentType(type)
    {
        return this.header('Content-Type', type);
    }

    cache(seconds)
    {
        return this.header('Cache-Control', `public, max-age=${seconds}`);
    }

    noCache()
    {
        return this.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    asAttachment(fileName = null)
    {
        this.header('Content-Description', 'File Transfer');
        this.attachmentFileName(fileName);

        // todo: remove this fork by implementing attachmentFileName()
        if (fileName)
        {
            return this.header('Content-Disposition', `attachment; filename="${fileName}"`);
        }
        else
        {
            return this.header('Content-Disposition', 'attachment');
        }
    }

    attachmentFileName(name)
    {
        // todo: dont send Content-Disposition, wait for possible attachmentFileName() call, and only then - send
        return this;
    }

    contentLength(length = 0)
    {
        return this.header('Content-Length', length);
    }

    // todo: support cookie parameters:
    // todo: see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
    cookie(name, value, options = {})
    {
        return this.header('Set-Cookie', `${name}=${value}`);
    }

    asPDF()
    {
        return this.contentType('application/pdf');
    }

    asCSV()
    {
        return this.contentType('text/csv');
    }

    asBinary()
    {
        return this.contentType('application/octet-stream');
    }

    asGIF()
    {
        return this.contentType('image/gif');
    }

    asJPG()
    {
        return this.contentType('image/jpeg');
    }

    asPNG()
    {
        return this.contentType('image/png');
    }

    asText()
    {
        return this.contentType('text/plain');
    }

    /**
     * See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers
     * https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types
     * @param name
     * @param value
     * @returns {ChainResponse}
     */
    header(name, value)
    {
        if (this._headersSent)
        {
            throw new Error('Cant send headers, my daring: they already sent...');
        }

        this.getRes().setHeader(name, value);
        return this;
    }

    trailer(name, value)
    {
        // todo

        return this;
    }

    s500()
    {
        return this.status(500);
    }

    s404()
    {
        return this.status(404);
    }

    s400()
    {
        return this.status(400);
    }

    s403()
    {
        return this.status(403);
    }

    status(code = 200)
    {
        if (this._headersSent)
        {
            throw new Error('Cant set status, my daring: headers already sent...');
        }

        this.getRes().status(code);
        return this;
    }

    /**
     * appends to an internal buffer
     */
    append(data)
    {
        // todo
    }

    write(data)
    {
        this.getRes().write(data);
        return this;
    }

    /**
     * flush internal buffer and optionally sends the data specified
     */
    send(data = null)
    {
        // todo
    }

    end()
    {
        this.getRes().end();
    }

    getRes()
    {
        return this._r;
    }
}
