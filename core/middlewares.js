const { join } = require('path')
const { web } = require(join(__dirname, "..", "urlconf", "rules"))

exports.isUserAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    return res.redirect(web.userLogin.url);
}

exports.isCanUserSee = (req, res, next) => {
    if (req.isAuthenticated()) return res.redirect(web.userDashboard.url);
    return next();
}

exports.canAccess = (req, res, next) => {
    if (req.isAuthenticated() && req.user.account_active === 1) return next();
    return res.redirect(web.userDashboard.url);
}