const web = require( join( BASE_DIR, 'urlconf/webRule' ) )

exports.user = {
	dashboard: {
		title: 'Dashboard',
		url: web.userDashboard.url,
		icon: '<i class="fas fa-th-large"></i>'
	},
	appInstall: {
		title: 'Install App',
		url: web.installApp.url,
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

exports.admin = {
	dashboard: {
		title: 'Dashboard',
		url: web.adminDashboard.url,
		icon: '<i class="fas fa-th-large"></i>'
	},
	userList: {
		title: 'User List',
		url: web.userList.url,
		icon: '<i class="fas fa-list-ul"></i>'
	},
}
