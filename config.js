module.exports = {
    port: 3012,
    storagePath: '/home/sergey/upload/',
    cachePath: '/home/sergey/.image-server-cache/',
    cacheTime: 3600,
    legalSizes: [
        [900, 900], // just for testing
        [100, 100], // admin previews
        [10, 10], // for fun
    ],
    // todo: implement cache ttl
};
