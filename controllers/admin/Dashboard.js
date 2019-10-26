exports.dashboardView = (req, res, next) => {
    res.render("admin/dashboard", {
        info: commonInfo,
        title: 'Admin',
        email: req.user.email,
        csrfToken: req.csrfToken(),
        userList: web.userList.url,
        userPayment: web.payment.url,
        userAccountStatusChange: web.accountStatusChange.url,
        userAccountDelete: web.accountDelete.url
    })
}

exports.adminLogout = (req, res) => {
    req.logout()
    req.flash('userLoginScreenSuccessMessage', 'Successfully Logout')
    res.redirect(web.adminLogin.url)
}