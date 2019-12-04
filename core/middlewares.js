"use strict";

exports.isUserAuthenticated = ( req, res, next ) => {
	if ( req.isAuthenticated() && req.user.role === "user" ) {
		return next()
	} else {
		return res.redirect( '/login/user' )
	}
}

exports.canUserSee = ( req, res, next ) => {
	if ( req.isAuthenticated() ) {
		return res.redirect( `/${req.user.role}/dashboard` )
	} else {
		return next()
	}
}

exports.isUserCanAccess = ( req, res, next ) => {
	if ( req.user.is_account_limit_available || !!req.user.trial ) {
		return next()
	} else {
		return res.redirect( '/user/dashboard' )
	}
}

exports.isAdminAuthenticated = ( req, res, next ) => {
	if ( req.isAuthenticated() && req.user.role === "admin" ) {
		return next()
	} else {
		return res.redirect( '/login/admin' )
	}
}

exports.flash = ( req, res, next ) => {

	if ( req.flash ) return next()

	if ( req.session === undefined ) throw Error( 'req.flash() requires sessions' )

	req.flash = ( type, msg ) => {
		if ( type && msg ) {
			let temp = {}
			temp[ type ] = msg
			req.session.flash = temp
			temp = null
		} else if ( type ) {
			msg = ( req.session.flash && !!req.session.flash[ type ] ) ? req.session.flash[ type ] : false
			req.session.flash = null
			return msg
		} else {
			return false
		}
	}

	next()
}
