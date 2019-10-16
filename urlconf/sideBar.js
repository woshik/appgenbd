const {web} = require('./urls')

module.exports = {
	dashboard : web.userDashboard,
	installApp : web.installApp,
	appList: web.appList,
	uploadContent: web.contentUpload,
	generateApplication: web.applicationGenerator
}