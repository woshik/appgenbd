const { join } = require("path")
const { commonInfo, localTime, onlyDate } = require(join(__dirname, "../../", "core", "util"))
const web = require(join(__dirname, "../../", "urlconf", "webRule"))
const sidebar = require(join(__dirname, "../../", "urlconf", "sidebar"))
const model = require(join(__dirname, "../../", "db", "model"));


const dashboardView = (req, res, next) => {

    res.render("admin/dashboard", {
        info: commonInfo,
        title: 'User List',
        email: req.user.email,
        csrfToken: req.csrfToken(),
    })
}

const adminLogout = (req, res) => {
    req.logout()
    req.flash('userLoginScreenSuccessMessage', 'Successfully Logout')
    res.redirect(web.adminLogin.url)
}

module.exports = {
    dashboardView,
    adminLogout
}