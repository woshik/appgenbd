const cluster = require("cluster")

// global declaration 
global.join = require("path").join
global.BASE_DIR = __dirname;

if (cluster.isMaster) {
    let numCPUs = require('os').cpus().length
    for (let i = 1; i < numCPUs; i++) {
        cluster.fork()
    }

    require(join(BASE_DIR, 'cron', 'serverCronJob'))

    if (process.env.NODE_ENV === "production") {
    	cluster.on('exit', (worker) => {
    		cluster.fork()
    	})
    }
} else {
    require(join(BASE_DIR, 'app', 'bootstrap'))
}