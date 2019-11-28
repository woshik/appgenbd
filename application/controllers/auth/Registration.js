"use strict";

const Joi = require( '@hapi/joi' );
const web = require( join( BASE_DIR, 'urlconf/webRule' ) );
const model_registration = require( join( MODEL_DIR, 'auth/Model_Registration' ) );
const {
	sendMail,
	companyInfo,
	fromErrorMessage
} = require( join( BASE_DIR, 'core/util' ) );

exports.registrationView = ( req, res ) => {
	res.render( "auth/base-template", {
		layout: 'registration',
		info: companyInfo,
		title: "Account Registration",
		csrfToken: req.csrfToken(),
		registrationForm: web.registration.url,
		loginPage: web.userLogin.url
	} )
}

exports.registration = ( req, res, next ) => {

	req.body.number = `+8801${req.body.number}`

	const schema = Joi.object( {
		name: Joi.string().trim().pattern( /^[a-zA-Z\s]+$/ ).required().label( "Name" ),
		number: Joi.string().trim().pattern( /^(\+8801)[0-9]{9}$/ ).required().label( "Mobile number" ),
		email: Joi.string().trim().email().required().label( "Email address" ),
		password: Joi.string().trim().min( 5 ).max( 50 ).label( "Password" ),
		confirm_password: Joi.ref( "password" )
	} )

	const validateResult = schema.validate( {
		name: req.body.name,
		number: req.body.number,
		email: req.body.email,
		password: req.body.password,
		confirm_password: req.body.confirm_password
	} )

	if ( validateResult.error ) {
		return res.json( {
			success: false,
			message: fromErrorMessage( validateResult.error.details[ 0 ] )
		} )
	}

	model_registration( validateResult.value )
		.then( ( {
			success,
			info
		} ) => {
			if ( !success ) {
				return res.json( {
					success: false,
					message: info
				} )
			} else {
				sendMail( info.ops[ 0 ].email, "Varification Code", info.ops[ 0 ].token ).catch( err => console.log( err ) )
				req.flash( 'accountActivationPageMessage', 'Please, check your email account.' )

				return res.json( {
					success: true,
					url: `${web.accountActivation.url}?email=${encodeURIComponent(info.ops[0].email)}&rd=${info.ops[0].userRDId}`
				} )
			}
		} )
		.catch( err => next( err ) )
}

exports.sendMailAgain = ( req, res, next ) => {
	const user = new model( "users" );
	user.findOne( {
			userRDId: req.params.id
		} )
		.then( userData => {
			if ( !userData ) {
				req.flash( 'userLoginScreenErrorMessage', 'User account not found' )
				return res.status( 200 ).json( {
					url: web.userLogin.url
				} )
			}

			if ( userData.mail_for_verification >= 5 ) {
				return res.status( 200 ).json( {
					message: 'You already send email too many time. Please wait for a while.'
				} );
			}

			if ( userData.token_refresh > new Date().getTime() ) {

				sendMail( userData.email, "Varification Code", userData.token )
					.then( response => {} )
					.catch( err => res.next( err ) )

				user.customUpdateOne( {
						userRDId: req.params.id
					}, {
						'$inc': {
							"mail_for_verification": 1
						}
					} )
					.then( userUpdateValue => {
						if ( !userUpdateValue.result.nModified ) {
							return res.status( 200 ).json( {
								message: 'Server Error. Please try again later.'
							} )
						}

						return res.status( 200 ).json( {
							message: 'Please, check your email address again.'
						} )
					} )
					.catch( err => next( err ) )
			} else {
				let tokenTime = new Date();

				let updateValue = {
					"$set": {
						"token": Math.floor( Math.random() * 100001 ),
						"token_refresh": tokenTime.setMinutes( tokenTime.getMinutes() + 10 )
					},
					"$inc": {
						"mail_for_verification": 1
					}
				};

				sendMail( userData.email, "Varification Code", updateValue.token )
					.then( response => {} )
					.catch( err => res.next( err ) )

				user.customUpdateOne( {
						userRDId: req.params.id
					}, updateValue )
					.then( userUpdateValue => {

						if ( !userUpdateValue.result.nModified ) {
							return res.status( 200 ).json( {
								message: 'Server Error. Please try again later.'
							} )
						}

						return res.status( 200 ).json( {
							message: "Please, check again your email address."
						} );
					} )
					.catch( err => next( err ) )
			}
		} )
		.catch( err => next( err ) )
}
