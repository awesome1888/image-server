module.exports = {
    port: 3012,
    storagePath: '/home/sergey/upload/',
    cachePath: '/home/sergey/.image-server-cache/',
    cacheTime: 3600,
    legalSizes: [
        [900, 900], // just for testing

        // article detail
        [900, 200],
        [900, 300],
        [800, 200],
        [400, 200],
        [200, 200],

        [100, 100], // admin previews
        [10, 10], // for fun
    ],
    useCluster: true,
    // todo: implement cache ttl
};
