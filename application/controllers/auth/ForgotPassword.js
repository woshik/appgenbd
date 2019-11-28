"use strict";

const Joi = require( '@hapi/joi' )
const { randomBytes } = require( 'crypto' )
const web = require( join( BASE_DIR, 'urlconf/webRule' ) )
const {
	hashPassword,
	sendMail
} = require( join( BASE_DIR, 'core', 'util' ) )
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
					url: `${web.accountActivation.url}?email=${encodeURIComponent(validateResult.value.email)}&rd=${info.userRDId}`
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

exports.forgotPasswordCodeVerifyView = ( req, res, next ) => {

	const schema = Joi.object( {
		email: Joi.string().trim().email().required(),
		rd: Joi.string().trim().hex().length( 16 ).required(),
	} );

	const validateResult = schema.validate( {
		email: req.query.email,
		rd: req.query.rd
	} );

	if ( validateResult.error ) {
		req.flash( 'userLoginPageMessage', 'Invalid address.' )
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
					title: "Account Verification",
					csrfToken: req.csrfToken(),
					verificationFormURL: web.forgotPasswordCodeVerify.url,
					sendEmailURL: web.sendCodeAgain.url,
					loginPageURL: web.userLogin.url,
					flashMessage: req.flash( 'accountVerificationPageMessage' ) || sendCode,
				} )
			} else {
				req.flash( 'userLoginPageMessage', info )
				return res.redirect( web.userLogin.url )
			}

		} )
		.catch( err => next( err ) )
}

exports.forgotPasswordCodeVerify = ( req, res, next ) => {

	const schema = Joi.object( {
		code: Joi.string().trim().required().label( "Verification code" )
	} )

	const validateResult = schema.validate( {
		code: req.body.code
	} )

	if ( validateResult.error ) {
		return res.status( 200 ).json( {
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

exports.changePasswordView = ( req, res, nex ) => {
	const user = new model( "users" )
	user.findOne( {
			userRDId: req.params.id,
			token: parseInt( req.params.code )
		} )
		.then( userData => {
			if ( !userData || !userData.email_verify || userData.forgot !== 1 ) {
				req.flash( 'userLoginScreenErrorMessage', 'The link you used is invalid. Please try again.' )
				return res.redirect( web.userLogin.url )
			}

			res.render( "auth/changePassword", {
				info: commonInfo,
				title: "Change Password",
				csrfToken: req.csrfToken(),
				changePasswordForm: web.passwordChange.url.replace( ":id", userData.userRDId ).replace( ":code", userData.token )
			} );
		} )
		.catch( err => next( err ) )
}

exports.changePassword = ( req, res, next ) => {

	const schema = Joi.object( {
		password: Joi.string().trim().min( 5 ).max( 50 ).label( "Password" ),
		confirm_password: Joi.ref( "password" )
	} )

	const validateResult = schema.validate( {
		password: req.body.password,
		confirm_password: req.body.confirm_password
	} )

	if ( validateResult.error ) {
		return res.status( 200 ).json( {
			success: false,
			message: fromErrorMessage( validateResult.error.details[ 0 ] )
		} )
	}

	const user = new model( "users" );

	user.findOne( {
			userRDId: req.params.id,
			token: parseInt( req.params.code ),
			forgot: 1
		} )
		.then( userAvailable => {

			if ( !userAvailable ) {
				return res.status( 200 ).json( {
					success: false,
					message: "User not found"
				} )
			}

			hashPassword( validateResult.value.password )
				.then( passwordHashed => {
					let password = {
						'password': passwordHashed,
						'forget': 0
					}
					user.updateOne( {
							_id: userAvailable._id
						}, password )
						.then( userUpdateValue => {
							if ( !userUpdateValue.result.nModified ) {
								return res.status( 200 ).json( {
									success: false,
									message: 'Server Error. Please try again later.'
								} )
							}

							req.flash( 'userLoginScreenSuccessMessage', 'Password Successfully Changed' )
							return res.status( 200 ).json( {
								success: true,
								message: web.userLogin.url
							} )
						} )
						.catch( err => next( err ) )
				} )
				.catch( err => next( err ) )
		} )
		.catch( err => next( err ) )
}
