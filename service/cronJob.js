const { CronJob } = require("cron");
const sendSms = require("sensSms");

// mail sending limit reset
new CronJob(
	"0 0 * * * *",
	function() {
		sendSms();
	},
	null,
	true
);
