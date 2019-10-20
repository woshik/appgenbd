const { join } = require('path')
const { isUserAuthenticated, isUserCanSee, canAccess } = require(join(__dirname, "..", "core", "middlewares"))

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
        middleware: [isUserAuthenticated, canAccess],
        path: 'user'
    },

    contentUpload: {
        url: '/contentupload',
        controller: 'ContentUpload',
        methods: {
            contentUploadView: 'get',
            contentUpload: 'post'
        },
        middleware: [isUserAuthenticated, canAccess],
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
        middleware: [isUserAuthenticated],
        path: 'admin'
    },

    adminLogout: {
        url: '/logout/admin',
        controller: 'Dashboard',
        methods: {
            adminLogout: 'get',
        },
        middleware: [isUserAuthenticated],
        path: 'admin'
    },
}