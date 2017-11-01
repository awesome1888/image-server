module.exports = {
    port: 3012,
    storagePath: '/home/sergey/upload/',
    cachePath: '/home/sergey/.image-server-cache/',
    cacheTime: 3600,
    availableSizes: [
        [1000, 1000],
        [120, 120], // admin previews
    ],
    // todo: implement cache ttl
};
