module.exports = {
	ussd: {
		url: "/:serial/:appName/ussd",
		controller: "Ussd",
		methods: {
			ussd: "post"
		},
		path: "api"
	}
};
