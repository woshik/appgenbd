api = {}

web = {
    userLogin: {
        url: '/login/user',
        controller: 'UserLogin',
        methods: {
            userLoginView: 'get',
            userLogin: 'post'
        },
        path: 'auth/'
    },
    registration: {
        url: '/registration',
        controller: 'Registration',
        methods: {
            registrationView: 'get',
            registration: 'post'
        },
        path: 'auth/'
    },

    emailVerification: {
        url: '/verification/:id',
        controller: 'EmailVerification',
        methods: {
            emailVerificationView: 'get',
            emailVerification: 'post',
        },
        path: 'auth/'
    },

    sendEmailAgain: {
        url: '/sendemailagain/:id',
        controller: 'Registration',
        methods: {
            sendMailAgain: 'post',
        },
        path: 'auth/'
    },

    forgotPassword: {
        url: '/forgotpassword',
        controller: 'ForgotPassword',
        methods: {
            forgotPasswordView: 'get',
            forgotPassword: 'post',
        },
        path: 'auth/'
    },

    forgotPasswordCodeVerify: {
        url: '/forgotpassword/verification/:id',
        controller: 'ForgotPassword',
        methods: {
            forgotPasswordCodeVerifyView: 'get',
            forgotPasswordCodeVerify: 'post',
        },
        path: 'auth/'
    },

    passwordChange: {
        url: '/changepassword/:id/:code',
        controller: 'ForgotPassword',
        methods: {
            changePasswordView: 'get',
            changePassword: 'post',
        },
        path: 'auth/'
    },

    userDashboard: {
        url: '/',
        controller: 'Dashboard',
        methods: {
            dashboardView: 'get',
        },
        path: 'user/'
    },

    userLogout: {
        url: '/',
        controller: 'Dashboard',
        methods: {
            userLogout: 'get',
        },
        path: 'user/'
    }

    // userLogout: '/logout/user', // user logout

    // : '/registration', // user registration
    // : '', // user email verification
    // forgotPassword: '', // forgot password
    // forgotPasswordPassCode: '/forgotpassword/verification/:id', // forgot password
    // changePassword: '',
    // // user login system end //

    // // user dashboard start //

    // userDashboard: '/', 
    // installApp: '/installapp',
    // appName: '/applicationname',
    // appList: '/applist',
    // userAppList: '/userapplist',
    // contentUpload: '/contentupload',
    // sendMessageDate: '/sendmessagedate',
    // applicationGenerator: '/applicationgenerator',
    // user dashboard end //

    // adminLogin: '/login/admin', // admin login
    // adminLogout: '/logout/admin', // admin logout
}

module.exports = { api, web };