exports.isUserAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    return res.redirect('/login/user');
}

exports.isUserCanSee = (req, res, next) => {
    if (req.isAuthenticated()) return res.redirect('/');
    return next();
}

exports.canAccess = (req, res, next) => {
    if (req.isAuthenticated() && req.user.account_active === 1) return next();
    return res.redirect('/');
}