"use strict";

const Joi = require( '@hapi/joi' )
const web = require( join( BASE_DIR, 'urlconf/webRule' ) )
const {
	checkUser,
	changePassword
} = require( join( MODEL_DIR, 'auth/Model_Account_Activation' ) )
const {
	companyInfo,
	fromErrorMessage
} = require( join( BASE_DIR, 'core/util' ) )

exports.changePasswordView = ( req, res, next ) => {

	// TODO: here we can check email & rd parameter using joi but I that not needed.
	if ( ( !req.query.email && !req.query.rd ) ) {
		req.flash( 'userLoginPageMessage', 'Invalid request.' )
		return res.redirect( web.userLogin.url )
	}

	checkUser( req.query.email, req.query.rd )
		.then( ( {
			success,
			info
		} ) => {
			if ( success ) {
				return res.render( "auth/base-template", {
					layout: "change-password",
					info: companyInfo,
					title: "Change Password",
					csrfToken: req.csrfToken(),
					changePasswordFormURL: web.changePassword.url,
					email: req.query.email,
					rd: req.query.rd,
				} )
			} else {
				req.flash( 'userLoginPageMessage', info )
				return res.redirect( web.userLogin.url )
			}

		} )
		.catch( err => next( err ) )
}

exports.changePassword = ( req, res, next ) => {

	// TODO: here we can check email & rd parameter using joi but I that not needed.
	if ( ( !req.body.email && !req.body.rd ) ) {
		return res.json( {
			success: false,
			message: 'Invalid request.'
		} );
	}

	const schema = Joi.object( {
		password: Joi.string().trim().min( 5 ).max( 50 ).label( "Password" ),
		confirm_password: Joi.ref( "password" )
	} )

	const validateResult = schema.validate( {
		password: req.body.password,
		confirm_password: req.body.confirm_password
	} )

	if ( validateResult.error ) {
		return res.json( {
			success: false,
			message: fromErrorMessage( validateResult.error.details[ 0 ] )
		} )
	}

	changePassword( req.body.email, req.body.rd, validateResult.value.password )
		.then( ( {
			success,
			info
		} ) => {
			if ( success ) {
				req.flash( 'userLoginPageMessage', info )
				return res.json( {
					success: true,
					message: web.userLogin.url
				} )
			} else {
				return res.json( {
					success: false,
					message: info
				} )
			}
		} )
		.catch( err => next( err ) )
}
