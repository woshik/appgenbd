exports.dashboardView = (req, res, next) => {
    res.render("admin/dashboard", {
        info: commonInfo,
        title: 'User List',
        email: req.user.email,
        csrfToken: req.csrfToken(),
        userList: web.userList.url
    })
}

exports.adminLogout = (req, res) => {
    req.logout()
    req.flash('userLoginScreenSuccessMessage', 'Successfully Logout')
    res.redirect(web.adminLogin.url)
}