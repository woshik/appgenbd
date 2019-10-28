const { CronJob } = require('cron')
const model = require(join(BASE_DIR, 'db', 'model'))
const { logger } = require(join(BASE_DIR, 'core', 'util'))

// mail sending limit reset
new CronJob('0 */20 * * * *', function() {
	let user = new model("users")
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