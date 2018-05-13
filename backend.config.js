module.exports = {
    useCluster: false, // don`t use cluster if you plan to use docker or pm2
	storagePath: '/home/nodejs/upload/',
	cachePath: '/home/nodejs/.resize-cache/',
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
};
