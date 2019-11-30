"use strict";

const Joi = require( '@hapi/joi' )
const web = require( join( BASE_DIR, 'urlconf/webRule' ) )
const {
	companyInfo,
	fromErrorMessage
} = require( join( BASE_DIR, 'core/util' ) )
const {
	checkEmail,
	checkUser
} = require( join( MODEL_DIR, 'auth/Model_Forgot_Password' ) )

exports.forgotPasswordView = ( req, res ) => {
	res.render( "auth/base-template", {
		layout: "forgot-password",
		info: companyInfo,
		title: "Forget Password",
		csrfToken: req.csrfToken(),
		forgotPasswordFormURL: web.forgotPassword.url,
		loginPageURL: web.userLogin.url,
	} )
}

exports.forgotPassword = ( req, res, next ) => {
	const schema = Joi.object( {
		email: Joi.string().trim().email().required().label( "Email address" ),
	} )

	const validateResult = schema.validate( {
		email: req.body.email,
	} )

	if ( validateResult.error ) {
		return res.json( {
			success: false,
			message: fromErrorMessage( validateResult.error.details[ 0 ] )
		} )
	}

	checkEmail( validateResult.value.email )
		.then( ( {
			success,
			info
		} ) => {
			if ( success ) {
				req.flash( 'accountVerificationPageMessage', 'Please, check your email account.' )

				return res.json( {
					success: true,
					url: `${web.accountVerification.url}?email=${encodeURIComponent(validateResult.value.email)}&rd=${info.userRDId}`
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
