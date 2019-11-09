const { isUserAuthenticated, isUserCanSee, canAccess, isSuperUser } = require(join(__dirname, "..", "core", "middlewares"))

module.exports = {
    userLogin: {
        url: '/login/user',
        controller: 'UserLogin',
        methods: {
            userLoginView: 'get',
            userLogin: 'post'
        },
        middleware: [isUserCanSee],
        path: 'auth'
    },
    registration: {
        url: '/registration',
        controller: 'Registration',
        methods: {
            registrationView: 'get',
            registration: 'post'
        },
        middleware: [isUserCanSee],
        path: 'auth'
    },

    emailVerification: {
        url: '/verification/:id',
        controller: 'EmailVerification',
        methods: {
            emailVerificationView: 'get',
            emailVerification: 'post',
        },
        middleware: [isUserCanSee],
        path: 'auth'
    },

    sendEmailAgain: {
        url: '/sendemailagain/:id',
        controller: 'Registration',
        methods: {
            sendMailAgain: 'post',
        },
        middleware: [isUserCanSee],
        path: 'auth'
    },

    forgotPassword: {
        url: '/forgotpassword',
        controller: 'ForgotPassword',
        methods: {
            forgotPasswordView: 'get',
            forgotPassword: 'post',
        },
        middleware: [isUserCanSee],
        path: 'auth'
    },

    forgotPasswordCodeVerify: {
        url: '/forgotpassword/verification/:id',
        controller: 'ForgotPassword',
        methods: {
            forgotPasswordCodeVerifyView: 'get',
            forgotPasswordCodeVerify: 'post',
        },
        middleware: [isUserCanSee],
        path: 'auth'
    },

    passwordChange: {
        url: '/changepassword/:id/:code',
        controller: 'ForgotPassword',
        methods: {
            changePasswordView: 'get',
            changePassword: 'post',
        },
        middleware: [isUserCanSee],
        path: 'auth'
    },


    //=====================================================================================================================================//
    //=========================================================== user Dashboard =========================================================//
    //===================================================================================================================================//


    userDashboard: {
        url: '/',
        controller: 'Dashboard',
        methods: {
            dashboardView: 'get',
        },
        middleware: [isUserAuthenticated],
        path: 'user'
    },

    userLogout: {
        url: '/logout/user',
        controller: 'Dashboard',
        methods: {
            userLogout: 'get',
        },
        middleware: [isUserAuthenticated],
        path: 'user'
    },

    userProfileSetting: {
        url: '/userprofilesetting',
        controller: 'Dashboard',
        methods: {
            userProfileSetting: 'post',
        },
        middleware: [isUserAuthenticated],
        path: 'user'
    },

    appInstall: {
        url: '/installapp',
        controller: 'InstallApp',
        methods: {
            appInstallView: 'get',
            appInstall: 'post',
        },
        middleware: [isUserAuthenticated, canAccess],
        path: 'user'
    },

    appName: {
        url: '/appname',
        controller: 'InstallApp',
        methods: {
            appName: 'post',
        },
        middleware: [isUserAuthenticated, canAccess],
        path: 'user'
    },

    appList: {
        url: '/applist',
        controller: 'AppList',
        methods: {
            appListView: 'get',
            appList: 'post'
        },
        middleware: [isUserAuthenticated],
        path: 'user'
    },

    appdetails: {
        url: '/appdetails/:appName',
        controller: 'AppDetails',
        methods: {
            appDetailsView: 'get',
            appDetails: 'post'
        },
        middleware: [isUserAuthenticated],
        path: 'user'
    },

    appdInfoUpdate: {
        url: '/appupdate',
        controller: 'AppList',
        methods: {
            appUpdate: 'post'
        },
        middleware: [isUserAuthenticated],
        path: 'user'
    },

    appStatusChange: {
        url: '/appstatuschange',
        controller: 'AppList',
        methods: {
            getAppStatus: 'get',
            appStatusChange: 'post',
        },
        middleware: [isUserAuthenticated],
        path: 'user'
    },

    contentUpload: {
        url: '/contentupload/:appName',
        controller: 'ContentUpload',
        methods: {
            contentUploadView: 'get',
            contentUpload: 'post'
        },
        middleware: [isUserAuthenticated],
        path: 'user'
    },

    updateContentUpload: {
        url: '/editcontent',
        controller: 'AppDetails',
        methods: {
            getContent: "get",
            updateContent: "post"
        },
        middleware: [isUserAuthenticated],
        path: 'user'
    },

    applicationGenerator: {
        url: '/applicationgenerator',
        controller: 'ApplicationGenerator',
        methods: {
            applicationGeneratorView: 'get',
            applicationGenerator: 'post'
        },
        middleware: [isUserAuthenticated, canAccess],
        path: 'user'
    },

    download: {
        url: '/applicationgenerator/download/:fileName',
        controller: 'ApplicationGenerator',
        methods: {
            download: 'get',
        },
        middleware: [isUserAuthenticated, canAccess],
        path: 'user'
    },



    //=====================================================================================================================================//
    //============================================================== Admin URL ===========================================================//
    //===================================================================================================================================//




    adminLogin: {
        url: '/login/admin',
        controller: 'AdminLogin',
        methods: {
            adminLoginView: 'get',
            adminLogin: 'post'
        },
        path: 'auth'
    },

    adminDashboard: {
        url: '/admin',
        controller: 'Dashboard',
        methods: {
            dashboardView: 'get',
        },
        middleware: [isSuperUser],
        path: 'admin'
    },

    adminLogout: {
        url: '/logout/admin',
        controller: 'Dashboard',
        methods: {
            adminLogout: 'get',
        },
        middleware: [isSuperUser],
        path: 'admin'
    },

    appSetting: {
        url: '/appsetting',
        controller: 'AppSetting',
        methods: {
            appSetting: 'post',
        },
        middleware: [isSuperUser],
        path: 'admin'
    },

    profileSetting: {
        url: '/profilesetting',
        controller: 'Dashboard',
        methods: {
            profileSetting: 'post',
        },
        middleware: [isSuperUser],
        path: 'admin'
    },

    userList: {
        url: '/userlist',
        controller: 'UserList',
        methods: {
            userList: 'post',
        },
        middleware: [isSuperUser],
        path: 'admin'
    },

    userMaxAppInstall: {
        url: '/usermaxappinstall',
        controller: 'UserList',
        methods: {
            userMaxAppInstall: 'get',
        },
        middleware: [isSuperUser],
        path: 'admin'
    },

    payment: {
        url: '/payment',
        controller: 'UserAction',
        methods: {
            payment: 'post',
        },
        middleware: [isSuperUser],
        path: 'admin'
    },

    accountStatusChange: {
        url: '/accountstatuschange',
        controller: 'UserAction',
        methods: {
            accountStatusChange: 'post',
        },
        middleware: [isSuperUser],
        path: 'admin'
    },

    accountDelete: {
        url: '/accountdelete',
        controller: 'UserAction',
        methods: {
            accountDelete: 'post',
        },
        middleware: [isSuperUser],
        path: 'admin'
    },

    accountDetails: {
        url: '/accountdetails',
        controller: 'AccountDetails',
        methods: {
            accountDetails: 'post',
        },
        middleware: [isSuperUser],
        path: 'admin'
    },
}