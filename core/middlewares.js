"use strict";

exports.isUserAuthenticated = ( req, res, next ) => {
	if ( req.isAuthenticated() && req.user.role === "user" ) {
		next()
	} else {
		res.redirect( '/login/user' )
	}
}

exports.isUserCanSee = ( req, res, next ) => {
	if ( req.isAuthenticated() ) {
		res.redirect( '/user/dashboard' )
	} else {
		next()
	}
}

exports.isUserCanAccess = ( req, res, next ) => {
	if ( req.user.is_account_limit_available ) {
		next()
	} else {
		res.redirect( '/user/dashboard' )
	}
}

exports.isAdminAuthenticated = ( req, res, next ) => {
	if ( req.isAuthenticated() && req.user.role === "admin" ) {
		next()
	} else {
		res.redirect( '/login/admin' )
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
