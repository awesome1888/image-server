module.exports = {
    useCluster: false, // don`t use cluster if you plan to use docker or pm2
    rootURL: 'http://localhost', // todo: if not specified here, should be taken from env ROOT_URL

    port: 3012, // todo: if not specified here, should be taken from env PORT
    database: {
        url: 'mongodb://localhost:27017/xinginator', // todo: if not specified here, should be taken from env MONGO_URL
        connectionRetries: 5,
        connectionTimeout: 1000,
    },
};
