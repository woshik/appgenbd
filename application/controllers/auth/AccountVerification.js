"use strict";

const Joi = require( '@hapi/joi' )
const dateTime = require( 'date-and-time' )
const web = require( join( BASE_DIR, 'urlconf/webRule' ) )
const {
	checkUser,
	checkCode
} = require( join( MODEL_DIR, 'auth/Model_Account_Verification' ) )
const {
	companyInfo,
	fromErrorMessage
} = require( join( BASE_DIR, 'core/util' ) )

exports.accountVerificationView = ( req, res, next ) => {
	// TODO: here we can check email & rd parameter using joi but I that not needed.
	if ( !req.query.email || !( req.query.rd && checkRDParam( req.query.rd ) ) ) {
		req.flash( 'userLoginPageMessage', 'Invalid request.' )
		return res.redirect( web.userLogin.url )
	}

	checkUser( req.query.email, req.query.rd )
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
					flashMessage: sendCode,
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

	// TODO: here we can check email & rd parameter using joi but I that not needed.
	if ( !req.body.email || !( req.body.rd && checkRDParam( req.body.rd ) ) ) {
		return res.json( {
			success: false,
			message: 'Invalid request.'
		} );
	}

	const schema = Joi.object( {
		code: Joi.string().trim().hex().length( 6 ).required().label( "Verification code" )
	} );

	const validateResult = schema.validate( {
		code: req.body.code,
	} );

	if ( validateResult.error ) {
		return res.json( {
			success: false,
			message: validateResult.error.details[ 0 ].message.indexOf( 'Verification code' ) > -1 ? 'Enter correct verification code.' : 'Invalid request.'
		} );
	}

	checkCode( req.body.email, req.body.rd, validateResult.value.code )
		.then( ( {
			success,
			info
		} ) => {
			if ( success ) {
				return res.json( {
					success: success,
					url: `${web.changePassword.url}?email=${encodeURIComponent(info.email)}&rd=${info.rd}`
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
	return rd.slice( 15 ) > now.getTime() && rd.slice( 8, 15 ) === `${dateTime.format(now, 'DD')}abd${dateTime.format(now, 'MM')}`
}
