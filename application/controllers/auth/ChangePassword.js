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
	}

	checkUser( validateResult.value )
		.then( ( {
			success,
			info,
			sendCode = null
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
