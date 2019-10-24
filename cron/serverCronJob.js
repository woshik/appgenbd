const { CronJob } = require('cron')

// mail sending limit reset
new CronJob('0 */30 * * * *', function() {
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