const { join } = require("path")
const { commonInfo, localTime, onlyDate } = require(join(__dirname, "../../", "core", "util"))
const web = require(join(__dirname, "../../", "urlconf", "webRule"))
const sidebar = require(join(__dirname, "../../", "urlconf", "sideBar"))
const model = require(join(__dirname, "../../", "db", "model"));


const dashboardView = (req, res, next) => {

    let dashboard = {
        accountDeactive: req.user.account_activation_end,
        maxApp: req.user.max_app_install,
        appInstalled: req.user.app_installed
    }

    res.render("user/dashboard", {
        info: commonInfo,
        title: 'Dashboard',
        userName: req.user.name,
        email: req.user.email,
        active: (localTime(onlyDate()).getTime() <= localTime(req.user.account_activation_end).getTime()),
        sidebar: sidebar,
        csrfToken: req.csrfToken(),
        path: req.path
    })
}

const userLogout = (req, res) => {
    req.logout()
    req.flash('userLoginScreenSuccessMessage', 'Successfully Logout')
    res.redirect(web.userLogin.url)
}

module.exports = {
    dashboardView,
    userLogout
}