"use strict";

const fs = require('fs');
const _ = require('underscore');

class SugarResponse
{
    constructor(res)
    {
        if (!res)
        {
            throw new TypeError('Argument is not an Express Response');
        }

        this._r = res;
        this._headersSent = res._headersSent;
        this._headers = {};
    }

    /**
     * @param source String|ReadableStream
     * @param options
     */
    streamFile(source, options)
    {
        options = options || {};

        const onBeforeOpen = _.isFunction(options.onBeforeOpen) ? options.onBeforeOpen : null;

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

        let setErrorCode = true;
        if ('setErrorCode' in options)
        {
            setErrorCode = !!options.setErrorCode;
        }

        let fileName = null;
        if (this.isStringNotEmpty(options.fileName))
        {
            fileName = options.fileName;
        }

        let escapeDots = true;
        if ('escapeDots' in options)
        {
            escapeDots = !!options.escapeDots;
        }

        let doEnd = true;
        if ('doEnd' in options)
        {
            doEnd = !!options.doEnd;
        }

        if (escapeDots && this.isStringNotEmpty(source))
        {
            source = source.replace(/\.+/g, '.');
        }

        const p = new Promise((resolve, reject) => {
            const doStream = () => {
                let stream = source;
                if (this.isStringNotEmpty(source))
                {
                    stream = fs.createReadStream(source);
                }

                stream.on('error', (error) => {
                    reject({self: this, error});
                });
                stream.on('end', () => {
                    stream.destroy();
                    resolve({self: this});
                });
                stream.on('open', () => {
                    if (asAttachment)
                    {
                        if (fileName !== null)
                        {
                            // todo: extract real file name here
                            fileName = 'file';
                        }

                        this.asAttachment(fileName);
                    }

                    this.sendHeaders();

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
                fs.stat(source, (error, stat) => {
                    if (error)
                    {
                        reject({self: this, error});
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

        const setError = (e) => {
            if (e.code === 'ENOENT')
            {
                this.s404();
            }
            else if (e.code === 'EACCES')
            {
                this.s403();
            }
            else
            {
                this.s500();
            }
        };

        if (doEnd)
        {
            p.then(() => {
                this.end();
            }).catch((result) => {
                if (setErrorCode)
                {
                    setError(result.error);
                }
                this.end();
            });
        }
        else if(setErrorCode)
        {
            p.catch((result) => {
                setError(result.error);
            });
        }

        return p;
    }

    /**
     * https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types
     * @param type
     * @returns {SugarResponse}
     */
    contentType(type)
    {
        return this.header('Content-Type', type);
    }

    cache(amount)
    {
        if (!amount)
        {
            amount = 0;
        }
        else
        {
            amount = amount.toString();

            if (amount.endsWith('d'))
            {
                amount = parseInt(amount.substr(0, amount.length - 1)) * 86400;
            }
        }

        return this.cacheControl(`public, max-age=${amount}`);
    }

    noCache()
    {
        return this.cacheControl('no-cache, no-store, must-revalidate');
    }

    cacheControl(value)
    {
        return this.header('Cache-Control', value);
    }

    asAttachment(fileName)
    {
        fileName = fileName || null;
        this.header('Content-Description', 'File Transfer');
        this.header('Content-Disposition', 'attachment');
        this.attachmentFileName(fileName);

        return this;
    }

    attachmentFileName(name)
    {
        if (name)
        {
            return this.header('Content-Disposition', `filename="${name}"`);
        }

        return this;
    }

    contentLength(length)
    {
        length = length || 0;
        return this.header('Content-Length', length);
    }

    // todo: support cookie parameters:
    // todo: see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
    cookie(name, value, options)
    {
        options = options || {};
        this._r.cookie(name, value, options);

        return this;
    }

    as(type)
    {
        return this.contentType(type);
    }

    asPDF()
    {
        return this.as('application/pdf');
    }

    asCSV()
    {
        return this.as('text/csv');
    }

    asBinary()
    {
        return this.as('application/octet-stream');
    }

    asGIF()
    {
        return this.as('image/gif');
    }

    asJPG()
    {
        return this.as('image/jpeg');
    }

    asPNG()
    {
        return this.as('image/png');
    }

    asText()
    {
        return this.as('text/plain');
    }

    asHTML()
    {
        return this.as('text/html');
    }

    asJSON()
    {
        return this.as('text/json');
    }

    charset(charset)
    {
        charset = charset || 'utf8';
        return this.header('Content-Type', `charset=${charset}`);
    }

    /**
     * See
     * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers
     * https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html
     * @param name
     * @param value
     * @returns {SugarResponse}
     */
    header(name, value)
    {
        value = value || null;
        if (this._headersSent)
        {
            throw new Error('Headers already sent');
        }

        if (!this.isStringNotEmpty(name))
        {
            return this;
        }

        if (value === null)
        {
            delete this._headers[name];
            return this;
        }

        const group = this.groupHeaderValueFor();

        if (name in group.multiple)
        {
            this._headers[name] = _.union(this._headers[name] || [], value.split(',').map(x => x.trim()));
        }
        else if (name in group.directiveBased)
        {
            const pValue = this._headers[name] || {};
            this._headers[name] = Object.assign(
                pValue,
                group.directiveBased[name].parser(value.split(';').map(x => x.trim()), pValue)
            );
        }
        else
        {
            this._headers[name] = this._headers[name] || [];
            this._headers[name].push(value);
        }

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

    s403()
    {
        return this.status(403);
    }

    s400()
    {
        return this.status(400);
    }

    s200()
    {
        return this.status(200);
    }

    status(code)
    {
        code = code || 200;
        if (this._headersSent)
        {
            throw new Error('Headers already sent');
        }

        this._r.status(code);
        return this;
    }

    sendHeaders()
    {
        if (!this._headersSent)
        {
            const group = this.groupHeaderValueFor();

            // console.dir('Headers:');
            // console.dir(this._headers);

            _.forEach(this._headers, (value, name) => {
                if (name in group.multiple)
                {
                    value = value.join(', ');

                    this._r.setHeader(name, value);
                }
                else if (name in group.directiveBased)
                {
                    const order = group.directiveBased[name].order;

                    value = order.reduce((result, item) => {
                        if (value[item])
                        {
                            result.push(value[item]);
                        }

                        return result;
                    }, []).join('; ');

                    this._r.setHeader(name, value);
                }
                else
                {
                    value.forEach((subValue) => {
                        console.dir(`${name} ${subValue}`);
                        this._r.setHeader(name, subValue);
                    });
                }
            });

            this._headersSent = true;
        }
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
        this.sendHeaders();
        this._r.write(data);
        return this;
    }

    /**
     * flush internal buffer and optionally sends the data specified
     */
    send(data)
    {
        data = data || '';
        if (data)
        {
            if (_.isObject(data))
            {
                this.asJSON();
                data = JSON.stringify(data);
            }
        }

        this.sendHeaders();

        // todo: send from the internal buffer

        if (data)
        {
            this._r.write(data);
        }

        return this;
    }

    end()
    {
        this.sendHeaders();
        this._r.end();
    }

    getRes()
    {
        return this._r;
    }

    groupHeaderValueFor()
    {
        return {
            multiple: {
                'Cache-Control': true,
                'Content-Language': true,
            },
            directiveBased: {
                'Content-Disposition': {
                    order: ['TYPE', 'NAME', 'FILENAME',],
                    parser: this.parseContentDisposition,
                },
                'Content-Type': {
                    order: ['MIME', 'CHARSET',],
                    parser: this.parseContentType,
                },
            },
        };
    }

    parseContentDisposition(value, previousValue)
    {
        const result = {};

        value.forEach((item) => {
            if (item.startsWith('filename='))
            {
                result.FILENAME = item;
                if (!previousValue.TYPE)
                {
                    result.TYPE = 'attachment';
                }
            }

            if (item === 'attachment' || item === 'inline')
            {
                result.TYPE = item;
            }
        });

        return result;
    }

    parseContentType(value, previousValue)
    {
        const result = {};

        value.forEach((item) => {
            if (item.startsWith('charset='))
            {
                result.CHARSET = item;
                if (!previousValue.MIME)
                {
                    result.MIME = 'text/plain';
                }
            }

            if (item.match(/^[^\/]+\/[^\/]+$/i))
            {
                result.MIME = item;
            }
        });

        return result;
    }

    isStringNotEmpty(value)
    {
        return _.isString(value) && value.length;
    }
}

module.exports = SugarResponse;
