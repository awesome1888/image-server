# Simple HTTP file server with image resize support

## Settings in config.js
~~~~
{
    // the port number this server runs at
    port: 3012,
    // the location of images we want to serve, should be accessible for reading
    storagePath: '/home/sergey/upload/',
    // the location of the resize cache, should be accessible for both reading and writing
    cachePath: '/home/sergey/.image-server-cache/',
    // the default cache time which is returned in Cache-Control HTTP header
    cacheTime: 3600,
    // the list of legal sizes; all requests with the pair of width and height which 
    // is not listed below, will be served as HTTP 400
    legalSizes: [
        [900, 900], // just for testing
        [100, 100], // admin previews
        [10, 10], // for fun
    ],
}
~~~~

## Request format

Via GET or POST:
* to obtain the original file: `/FILE_NAME` (example: `/0bea7150ac2628c72bb0a77f76bed186.jpg`)
* to obtain the resized file: `/FILE_NAME/WIDTH/HEIGHT` (example: `/0bea7150ac2628c72bb0a77f76bed186.jpg/900/900`)

## Copyright

`awesome1888@gmail.com`, MIT License