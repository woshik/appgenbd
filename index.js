"use strict";

const cluster = require("cluster");
let worker_id;

// global declaration
global.join = require("path").join;
global.BASE_DIR = __dirname;

require(join(BASE_DIR, "bootstrap", "app"));

// if (cluster.isMaster) {
// 	let numCPUs = require("os").cpus().length;
// 	for (let i = 0; i < numCPUs; i++) {
// 		cluster.fork({
// 			worker_id: i + 1
// 		});
// 	}

// 	if (process.env.NODE_ENV === "production") {
// 		masterCommunicator(1);
// 		cluster.on("exit", worker => {
// 			let newWork = cluster.fork({
// 				worker_id: worker_id === worker.id ? 1 : Object.keys(cluster.workers).length + 1
// 			});

// 			if (worker_id === worker.id) {
// 				masterCommunicator(newWork.id);
// 			}
// 		});
// 	}
// } else if (parseInt(cluster.worker.process.env.worker_id) === 1) {
// 	if (process.env.NODE_ENV === "production") {
// 		process.send({
// 			type: "cron",
// 			id: cluster.worker.id
// 		});
// 	}

// 	// application cron job
// 	require(join(BASE_DIR, "service", "cronJob"));
// } else {
// 	// application bootstrap
// 	require(join(BASE_DIR, "bootstrap", "app"));
// }

// function masterCommunicator(id) {
// 	cluster.workers[`${id}`].on("message", identity => {
// 		if (identity.type === "cron") {
// 			worker_id = identity.id;
// 		}
// 	});
// }
