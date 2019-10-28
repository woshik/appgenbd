const sidebar = require(join(BASE_DIR, 'urlconf', 'sideBar'))

exports.dashboardView = (req, res, next) => {
    let user = new model('users')
    
    user.findOne({ _id: req.user._id })
        .then(userData => {
            let dashboardData = {
                info: commonInfo,
                title: 'Dashboard',
                userName: req.user.name,
                email: req.user.email,
                active: req.user.active,
                sidebar: sidebar,
                csrfToken: req.csrfToken(),
                balance: userData.reserved_ammount,
                path: req.path,
                active: dateTime.format(new Date(userData.account_active_date), 'DD-MM-YYYY'),
                expire: dateTime.format(new Date(userData.account_activation_end), 'DD-MM-YYYY'),
                maxApp: userData.max_app_install,
                appInstalled: userData.app_install,
                totalSubscriber: userData.total_subscribe
            }
            
            res.render("user/dashboard", dashboardData)
        })
        .catch(err => next(err))
}

exports.userLogout = (req, res) => {
    req.flash('userLoginScreenSuccessMessage', 'Successfully Logout')
    req.logout()
    res.redirect(web.userLogin.url)
}