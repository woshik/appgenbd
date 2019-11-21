"use strict";

exports.isUserAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        if (!!req.user.super_user) {
            res.redirect(web.adminDashboard.url)
        } else {
            next()
        }
    } else {
        res.redirect(web.userLogin.url)
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

exports.flash = (req, res, next) => {
    
    if (req.flash) return next()

    if (this.session === undefined) throw Error('req.flash() requires sessions')

    req.flash = (type, msg) => {
        if (type && msg) {
            this.session.flash[type] = msg
        } else if (type) {
            return (this.session.flash && !!this.session.flash[type]) ? this.session.flash[type] : false
        } else {
            return false
        }
    }

    next()
}

exports.unsetFlashMessage = (req, res, next) => {
    !!req.session.flash && (req.session.flash = null)
    next()
}