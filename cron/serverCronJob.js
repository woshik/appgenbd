const { CronJob } = require('cron')
const { join } = require('path')
const { logger } = require(join(__dirname, "..", "core", "util"))
const model = require(join(__dirname, "..", "db", "model"));


// mail sending limit reset
new CronJob('0 */15 * * * *', function() {
	let user = new model("users");
	user.updateMany({ mail_for_verification: 5 }, { 'mail_for_verification': 0 })
		.then(response => {})
		.catch(err => logger.error(err))
}, null, true)

new CronJob('0 */25 * * * *', function() {
	let user = new model("users");
	user.updateMany({ forget: 1 }, { 'forget': 0 })
		.then(response => {})
		.catch(err => logger.error(err))
}, null, true)