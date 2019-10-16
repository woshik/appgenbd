const cluster = require('cluster')
const { join } = require("path")

if (cluster.isMaster) {
    let numCPUs = require('os').cpus().length
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
    }

    // cluster.on('exit', (worker, code, signal) => {
    //     cluster.fork()
    // })
} else if (cluster.worker.id !== 1) {
    require(join(__dirname, "bootstrap"))
} else {
    require(join(__dirname, "cron", "serverCronJob"))
}