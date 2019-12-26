const { CronJob } = require("cron");

// mail sending limit reset
new CronJob("* */60 * * * *", function() {}, null, true);
