const { join } = require('path')
const { localTime, onlyDate } = require(join(__dirname, '..', 'core', 'util'))

exports.isUserAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next()
    return res.redirect('/login/user')
}

exports.isUserCanSee = (req, res, next) => {
    if (req.isAuthenticated()) return res.redirect('/')
    return next()
}

exports.canAccess = (req, res, next) => {
    if (req.isAuthenticated() && (localTime(onlyDate()).getTime() <= localTime(req.user.account_activation_end).getTime()) ) return next()
    return res.redirect('/')
}