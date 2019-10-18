const { join } = require("path")
const { commonInfo } = require(join(__dirname, "../../", "core", "util"))
const web = require(join(__dirname, "../../", "urlconf", "webRule"))
const sidebar = require(join(__dirname, "../../", "urlconf", "sidebar"))
const model = require(join(__dirname, "../../", "db", "model"));


const dashboardView = (req, res, next) => {
    res.render("user/dashboard", {
        info: commonInfo,
        title: 'Dashboard',
        userName: req.user.name,
        email: req.user.email,
        active: req.user.account_active,
        sidebar: sidebar,
        path: req.path
    });
};

const userLogout = (req, res) => {
    req.logout()
    console.log('ok')
    req.flash('userLoginScreenSuccessMessage', 'Successfully Logout')
    res.redirect(web.userLogin.url)
}

module.exports = {
    dashboardView,
    userLogout
}