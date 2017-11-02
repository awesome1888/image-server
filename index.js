#!/usr/bin/env node

const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

let Application = require('./application/index.js');

if (cluster.isMaster)
{
    // create workers
    console.dir(`Cpu num: ${numCPUs}`);
    for (let i = 0; i < numCPUs; i++)
    {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died, replacing...`);
        cluster.fork();
    });
}
else
{
    // creating worker application, it will share all tcp connections
    // https://linuxtrainers.wordpress.com/2014/12/31/how-fork-system-call-works-what-is-shared-between-parent-and-child-process/
    (new Application()).launch();
}
