exports.isUserAuthenticate = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    return res.status(302).redirect(web.userLogin + '?loginRequired');
}

exports.isUserSee = (req, res, next) => {
    if (req.isAuthenticated()) return res.status(302).redirect(web.userDashboard);
    return next();
}

exports.canAccess = (req, res, next) => {
    if (req.isAuthenticated() && req.user.account_active === 1) return next();
    return res.status(302).redirect(web.userDashboard);
}