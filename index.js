const cluster = require("cluster")

// global declaration 
global.join = require("path").join
global.BASE_DIR = __dirname
require(join(BASE_DIR, 'app', 'autoloader'))

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