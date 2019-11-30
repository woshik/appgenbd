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

exports.accountVerificationView = ( req, res, next ) => {

	const schema = Joi.object( {
		email: Joi.string().trim().email().required(),
		rd: Joi.string().trim().hex().required(),
	} );

	const validateResult = schema.validate( {
		email: req.query.email,
		rd: req.query.rd
	} );

	if ( validateResult.error ) {
		req.flash( 'userLoginPageMessage', 'Invalid request.' )
		return res.redirect( web.userLogin.url )
	} else if ( !checkRDParam( validateResult.value.rd ) ) {
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
					layout: "account-varification",
					info: companyInfo,
					title: "Account Varification",
					csrfToken: req.csrfToken(),
					verificationFormURL: web.accountVerification.url,
					sendCodeAgainURL: web.sendCodeAgain.url,
					loginPageURL: web.userLogin.url,
					flashMessage: req.flash( 'accountVerificationPageMessage' ) || sendCode,
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

exports.accountVerification = ( req, res, next ) => {
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

	if ( validateResult.error ) {
		return res.json( {
			success: false,
			message: validateResult.error.details[ 0 ].message.indexOf( 'Verification code' ) > -1 ? 'Enter correct verification code.' : 'Invalid request.'
		} );
	} else if ( !checkRDParam( validateResult.value.rd ) ) {
		return res.json( {
			success: false,
			message: 'Invalid request.'
		} )
	}

	checkCode( validateResult.value )
		.then( ( {
			success,
			info
		} ) => {
			if ( success ) {
				return res.json( {
					success: success,
					url: `${web.accountActivation.url}?email=${encodeURIComponent(validateResult.value.email)}&rd=${info.userRDId}`
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
