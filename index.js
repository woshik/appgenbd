const cluster = require("cluster")

// global declaration 
global.join = require("path").join
global.BASE_DIR = __dirname

// environment setup
let env = 0

process.env.NODE_ENV = env ? "production" : "development"

 
if (cluster.isMaster) {
    let numCPUs = require('os').cpus().length
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
    }

    if (process.env.NODE_ENV === "production") {
    	cluster.on('exit', (worker) => {
    		cluster.fork()
    	})
    }

} else if (cluster.worker.id === 1) {
    require(join(BASE_DIR, 'cron', 'serverCronJob'))
} else {
    require(join(BASE_DIR, 'app', 'bootstrap'))
}