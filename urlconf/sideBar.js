const web = require( join( BASE_DIR, 'urlconf/webRule' ) )

exports.user = {
	dashboard: {
		title: 'Dashboard',
		url: web.userDashboard.url,
		icon: '<i class="fas fa-th-large"></i>'
	},
	appInstall: {
		title: 'Install App',
		url: web.appInstall.url,
		icon: '<i class="fas fa-arrow-alt-circle-down"></i>'
	},
	appList: {
		title: 'App List',
		url: web.appList.url,
		icon: '<i class="fas fa-list-ul"></i>'
	},
	generateApplication: {
		title: 'Application Generator',
		url: web.applicationGenerator.url,
		icon: '<i class="fas fa-file-pdf"></i>'
	}
}

exports.admin = null
