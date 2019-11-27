"use strict";

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
        res.redirect('/login/admin')
    }
}

exports.flash = (req, res, next) => {
    
    if (req.flash) return next()

    if (req.session === undefined) throw Error('req.flash() requires sessions')

    req.flash = (type, msg) => {
        if (type && msg) {
            let temp = {}
            temp[type] = msg
            req.session.flash = temp
            temp = null
        } else if (type) {
            msg = (req.session.flash && !!req.session.flash[type]) ? req.session.flash[type] : false
            req.session.flash = null
            return msg
        } else {
            return false
        }
    }

    next()
}