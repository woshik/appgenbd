exports.isUserAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        if (!!req.user.super_user) {
            res.redirect(web.adminDashboard.url)
        } else {
            next()
        }
    } else {
        res.redirect(web.adminDashboard.url)
    }
}

exports.isUserCanSee = (req, res, next) => {
    if (req.isAuthenticated()) {
        res.redirect(web.userDashboard.url)
    } else {
        next()
    }
}

exports.canAccess = (req, res, next) => {
    if (req.isAuthenticated() && req.user.active) {
        next()
    } else {
        res.redirect(web.userDashboard.url)
    }
}

exports.isSuperUser = (req, res, next) => {
    if (req.isAuthenticated() && req.user.super_user) {
        next()
    } else {
        res.redirect(web.adminLogin.url)
    }
}