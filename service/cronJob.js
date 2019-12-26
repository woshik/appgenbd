const { CronJob } = require("cron");
const sendSms = require("sensSms");

// mail sending limit reset
new CronJob(
	"* */60 * * * *",
	function() {
		sendSms();
	},
	null,
	true
);
