"use strict";

const Joi = require( '@hapi/joi' )
const dateTime = require( 'date-and-time' )
const web = require( join( BASE_DIR, 'urlconf/webRule' ) )
const {
	checkUser,
	checkCode
} = require( join( MODEL_DIR, 'auth/Model_Account_Activation' ) )
const {
	companyInfo,
	fromErrorMessage
} = require( join( BASE_DIR, 'core/util' ) )

exports.accountActivationView = ( req, res, next ) => {

	const schema = Joi.object( {
		email: Joi.string().trim().email().required(),
		rd: Joi.string().trim().hex().required(),
	} );

	const validateResult = schema.validate( {
		email: req.query.email,
		rd: req.query.rd
	} );

	if ( validateResult.error || !checkRDParam( req.query.rd ) ) {
		req.flash( 'userLoginPageMessage', 'Invalid request.' )
		return res.redirect( web.userLogin.url )
	}

	checkUser( validateResult.value )
		.then( ( {
			success,
			info,
			sendCode = null
		} ) => {
			if ( success ) {
				return res.render( "auth/base-template", {
					layout: "account-activation",
					info: companyInfo,
					title: "Account Activation",
					csrfToken: req.csrfToken(),
					verificationFormURL: web.accountActivation.url,
					sendCodeAgainURL: web.sendCodeAgain.url,
					loginPageURL: web.userLogin.url,
					flashMessage: req.flash( 'accountActivationPageMessage' ) || sendCode,
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

exports.accountActivation = ( req, res, next ) => {
	const schema = Joi.object( {
		email: Joi.string().trim().email().required(),
		rd: Joi.string().trim().hex().required(),
		code: Joi.string().trim().hex().length( 6 ).required().label( "Verification code" ),
	} );

	const validateResult = schema.validate( {
		email: req.body.email,
		rd: req.body.rd,
		code: req.body.code,
	} );

	if ( validateResult.error || !checkRDParam( req.body.rd ) ) {
		return res.json( {
			success: false,
			message: validateResult.error.details[ 0 ].message.indexOf( 'Verification code' ) > -1 ? fromErrorMessage( validateResult.error.details[ 0 ] ) : 'Invalid request.'
		} );
	}

	checkCode( validateResult.value )
		.then( ( {
			success,
			info
		} ) => {
			if ( success ) {
				req.flash( 'userLoginPageMessage', 'Account successfully activated.' )
				return res.json( {
					success: success,
					url: web.userLogin.url
				} )
			} else {
				return res.json( {
					success: success,
					message: info
				} )
			}
		} )
		.catch( err => next( err ) )
}

function checkRDParam( rd ) {
	let now = dateTime.addHours( new Date(), 6 )
	return rd.slice( 15 ) > now.getTime() && rd.slice( 8, 15 ) === `${dateTime.format(now, 'DD')}ace${dateTime.format(now, 'MM')}`
}
