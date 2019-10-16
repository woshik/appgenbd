const { CronJob } = require('cron')
const { join } = require('path')
const { logger } = require(join(__dirname, "..", "core", "util"))
const model = require(join(__dirname, "../", "db", "model"));


// mail sending limit reset
new CronJob('* 15 * * * *', function() {
	console.log('mail reset')
	let user = new model("users");
	user.updateMany({ mail_for_verification: 5 }, { 'mail_for_verification': 0 })
		.then(response => {})
		.catch(err => logger.error(err))
}, null, true);