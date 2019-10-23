exports.isUserAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        if (!!req.user.super_user) {
            res.redirect('/admin')
        } else {
            next()
        }
    } else {
        res.redirect('/login/user')
    }
}

exports.isUserCanSee = (req, res, next) => {
    if (req.isAuthenticated()) {
        res.redirect('/')
    } else {
        next()
    }
}

exports.canAccess = (req, res, next) => {
    if (req.isAuthenticated() && req.user.active) {
        next()
    } else {
        res.redirect('/')
    }
}

exports.isSuperUser = (req, res, next) => {
    if (req.isAuthenticated() && req.user.super_user) {
        next()
    } else {
        res.redirect('/')
    }
}