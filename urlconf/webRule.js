"use strict";

const { isUserAuthenticated, isAdminAuthenticated, canUserSee, isUserCanAccess } = require(join(BASE_DIR, "core", "middlewares"));

module.exports = {
	userLogin: {
		url: "/login/user",
		controller: "UserLogin",
		methods: {
			userLoginView: "get",
			userLogin: "post"
		},
		middleware: [canUserSee],
		path: "auth"
	},

	registration: {
		url: "/registration",
		controller: "Registration",
		methods: {
			registrationView: "get",
			registration: "post"
		},
		middleware: [canUserSee],
		path: "auth"
	},

	accountActivation: {
		url: "/account/active",
		controller: "AccountActivation",
		methods: {
			accountActivationView: "get",
			accountActivation: "post"
		},
		middleware: [canUserSee],
		path: "auth"
	},

	forgotPassword: {
		url: "/forgot-password",
		controller: "ForgotPassword",
		methods: {
			forgotPasswordView: "get",
			forgotPassword: "post"
		},
		middleware: [canUserSee],
		path: "auth"
	},

	accountVerification: {
		url: "/account/verification",
		controller: "AccountVerification",
		methods: {
			accountVerificationView: "get",
			accountVerification: "post"
		},
		middleware: [canUserSee],
		path: "auth"
	},

	changePassword: {
		url: "/account/change-password",
		controller: "ChangePassword",
		methods: {
			changePasswordView: "get",
			changePassword: "post"
		},
		middleware: [canUserSee],
		path: "auth"
	},

	sendCodeAgain: {
		url: "/send-code",
		controller: "SendCodeAgain",
		methods: {
			sendCodeAgain: "post"
		},
		middleware: [canUserSee],
		path: "auth"
	},

	//=====================================================================================================================================//
	//=========================================================== user Dashboard =========================================================//
	//===================================================================================================================================//

	userDashboard: {
		url: "/user/dashboard",
		controller: "Dashboard",
		methods: {
			dashboardView: "get"
		},
		middleware: [isUserAuthenticated],
		path: "user"
	},

	userLogout: {
		url: "/user/logout",
		controller: "Dashboard",
		methods: {
			userLogout: "get"
		},
		middleware: [isUserAuthenticated],
		path: "user"
	},

	userProfileSetting: {
		url: "/user/profile-setting",
		controller: "Dashboard",
		methods: {
			userProfileSetting: "post"
		},
		middleware: [isUserAuthenticated],
		path: "user"
	},

	installApp: {
		url: "/user/install-app",
		controller: "InstallApp",
		methods: {
			installAppView: "get",
			installApp: "post"
		},
		middleware: [isUserAuthenticated, isUserCanAccess],
		path: "user"
	},

	appName: {
		url: "/user/app-name",
		controller: "InstallApp",
		methods: {
			appName: "post"
		},
		middleware: [isUserAuthenticated, isUserCanAccess],
		path: "user"
	},

	appList: {
		url: "/user/app-list",
		controller: "AppList",
		methods: {
			appListView: "get",
			appList: "get"
		},
		middleware: [isUserAuthenticated],
		path: "user"
	},

	appListGet: {
		url: "/user/app-list/get",
		controller: "AppList",
		methods: {
			appList: "get"
		},
		middleware: [isUserAuthenticated],
		path: "user"
	},

	appdetails: {
		url: "/user/app-details",
		controller: "AppDetails",
		methods: {
			appDetailsView: "get"
		},
		middleware: [isUserAuthenticated],
		path: "user"
	},

	appMessageContent: {
		url: "/user/app-message-content",
		controller: "AppDetails",
		methods: {
			getAppMessageContent: "get"
		},
		middleware: [isUserAuthenticated],
		path: "user"
	},

	appdInfoUpdate: {
		url: "/user/app-update",
		controller: "AppList",
		methods: {
			appUpdate: "post"
		},
		middleware: [isUserAuthenticated],
		path: "user"
	},

	appStatusChange: {
		url: "/user/app-status-change",
		controller: "AppList",
		methods: {
			appStatusChange: "post"
		},
		middleware: [isUserAuthenticated],
		path: "user"
	},

	deleteApp: {
		url: "/user/delete-app",
		controller: "AppList",
		methods: {
			deleteApp: "delete"
		},
		middleware: [isUserAuthenticated],
		path: "user"
	},

	contentUpload: {
		url: "/user/content-upload",
		controller: "ContentUpload",
		methods: {
			contentUploadView: "get",
			contentUpload: "post"
		},
		middleware: [isUserAuthenticated, isUserCanAccess],
		path: "user"
	},

	updateContentUpload: {
		url: "/user/edit-content",
		controller: "AppDetails",
		methods: {
			getContent: "get",
			updateContent: "post"
		},
		middleware: [isUserAuthenticated, isUserCanAccess],
		path: "user"
	},

	applicationGenerator: {
		url: "/user/application-generator",
		controller: "ApplicationGenerator",
		methods: {
			applicationGeneratorView: "get",
			applicationGenerator: "post"
		},
		middleware: [isUserAuthenticated, isUserCanAccess],
		path: "user"
	},

	download: {
		url: "/user/application-generator/download",
		controller: "ApplicationGenerator",
		methods: {
			download: "get"
		},
		middleware: [isUserAuthenticated, isUserCanAccess],
		path: "user"
	},

	//=====================================================================================================================================//
	//============================================================== Admin URL ===========================================================//
	//===================================================================================================================================//

	adminLogin: {
		url: "/login/admin",
		controller: "AdminLogin",
		methods: {
			adminLoginView: "get",
			adminLogin: "post"
		},
		middleware: [canUserSee],
		path: "auth"
	},

	adminDashboard: {
		url: "/admin/dashboard",
		controller: "Dashboard",
		methods: {
			dashboardView: "get"
		},
		middleware: [isAdminAuthenticated],
		path: "admin"
	},

	adminLogout: {
		url: "/admin/logout",
		controller: "Dashboard",
		methods: {
			adminLogout: "get"
		},
		middleware: [isAdminAuthenticated],
		path: "admin"
	},

	applicationSetting: {
		url: "/application-setting",
		controller: "AppSetting",
		methods: {
			getApplicationSettingData: "get",
			appSetting: "post"
		},
		middleware: [isAdminAuthenticated],
		path: "admin"
	},

	profileSetting: {
		url: "/admin/profile-setting",
		controller: "Dashboard",
		methods: {
			profileSetting: "post"
		},
		middleware: [isAdminAuthenticated],
		path: "admin"
	},

	userList: {
		url: "/user-list",
		controller: "UserList",
		methods: {
			userListView: "get",
			userList: "post"
		},
		middleware: [isAdminAuthenticated],
		path: "admin"
	},

	userList: {
		url: "/user-list/get",
		controller: "UserList",
		methods: {
			userList: "get"
		},
		middleware: [isAdminAuthenticated],
		path: "admin"
	},

	userMaxAppInstall: {
		url: "/usermaxappinstall",
		controller: "UserList",
		methods: {
			userMaxAppInstall: "get"
		},
		middleware: [isAdminAuthenticated],
		path: "admin"
	},

	payment: {
		url: "/payment",
		controller: "UserAction",
		methods: {
			payment: "post"
		},
		middleware: [isAdminAuthenticated],
		path: "admin"
	},

	accountStatusChange: {
		url: "/account-status-change",
		controller: "UserAction",
		methods: {
			accountStatusChange: "post"
		},
		middleware: [isAdminAuthenticated],
		path: "admin"
	},

	accountDelete: {
		url: "/account-delete",
		controller: "UserAction",
		methods: {
			accountDelete: "post"
		},
		middleware: [isAdminAuthenticated],
		path: "admin"
	},

	accountDetails: {
		url: "/account-details",
		controller: "AccountDetails",
		methods: {
			accountDetails: "post"
		},
		middleware: [isAdminAuthenticated],
		path: "admin"
	}
};
