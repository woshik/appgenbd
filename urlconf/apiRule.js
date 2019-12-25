module.exports = {
	ussd: {
		url: "/:serial/:appName/ussd",
		controller: "USSD",
		methods: {
			ussd: "post"
		},
		path: "api"
	},
	sms: {
		url: "/:serial/:appName/sms",
		controller: "SMS",
		methods: {
			ussd: "post"
		},
		path: "api"
	}
};
