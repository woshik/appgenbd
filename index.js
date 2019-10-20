const cluster = require("cluster")
const { join } = require("path")

if (cluster.isMaster) {
    let numCPUs = require('os').cpus().length
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
    }

    require(join(__dirname, "cron", "serverCronJob"))

    // cluster.on('exit', (worker, code, signal) => {
    //     cluster.fork()
    // })
} else {
    require(join(__dirname, "app", "bootstrap"))
}