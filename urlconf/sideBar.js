const { join } = require('path')
const web = require(join(__dirname, 'webRule'))

module.exports = {
	dashboard : web.userDashboard.url,
	// installApp : web.installApp,
	// appList: web.appList,
	// uploadContent: web.contentUpload,
	// generateApplication: web.applicationGenerator
}