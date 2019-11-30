"use strict";

const Joi = require( '@hapi/joi' )

exports.accountVerificationView = ( req, res, next ) => {
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
					layout: "account-varification",
					info: companyInfo,
					title: "Account Varification",
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

exports.accountVerification = ( req, res, next ) => {
	const schema = Joi.object( {
		code: Joi.string().trim().required().label( "Verification code" )
	} )

	const validateResult = schema.validate( {
		code: req.body.code
	} )

	if ( validateResult.error ) {
		return res.json( {
			success: false,
			message: fromErrorMessage( validateResult.error.details[ 0 ] )
		} )
	}

	const user = new model( "users" )
	user.findOne( {
			userRDId: req.params.id
		} )
		.then( userData => {

			if ( !userData || !userData.email_verify ) {
				return res.status( 200 ).json( {
					success: false,
					message: "User account not found"
				} )
			}

			if ( userData.forgot !== 1 ) {
				return res.status( 200 ).json( {
					success: false,
					message: "User account not active"
				} )
			}

			if ( userData.forgot_token_time.getTime() > new Date().getTime() ) {
				if ( userData.token !== parseInt( validateResult.value.code ) ) {
					return res.status( 200 ).json( {
						success: false,
						message: "Please enter valid verification code"
					} )
				}

				let userRDId = crypto.randomBytes( 30 ).toString( 'hex' )
				user.updateOne( {
						userRDId: req.params.id
					}, {
						"userRDId": userRDId
					} )
					.then( userUpdateValue => {
						if ( !userUpdateValue.result.nModified ) {
							return res.status( 200 ).json( {
								success: false,
								message: 'Server Error. Please try again later.'
							} )
						}

						return res.status( 200 ).json( {
							success: true,
							message: web.passwordChange.url.replace( ":id", userRDId ).replace( ":code", validateResult.value.code )
						} )
					} )
					.catch( err => next( err ) )

			} else {

				let tokenTime = new Date()
				tokenTime.setMinutes( tokenTime.getMinutes() + 10 )
				let token = Math.floor( Math.random() * 100001 )

				sendMail( userData.email, "Varification Code", token )
					.then( response => {} )
					.catch( err => next( err ) )

				user.updateOne( {
						userRDId: req.params.id
					}, {
						"token": token,
						"forgot_token_time": tokenTime
					} )
					.then( userUpdateValue => {

						if ( !userUpdateValue.result.nModified ) {
							return res.status( 200 ).json( {
								success: false,
								message: 'Server Error. Please try again later.'
							} )
						}

						return res.status( 200 ).json( {
							success: false,
							message: "Please, check your email account again. Verification code time finish."
						} )
					} )
					.catch( err => next( err ) )
			}
		} )
		.catch( err => next( err ) )
}

function checkRDParam( rd ) {
	let now = dateTime.addHours( new Date(), 6 )
	return rd.slice( 15 ) > now.getTime() && rd.slice( 8, 15 ) === `${dateTime.format(now, 'DD')}ace${dateTime.format(now, 'MM')}`
}
