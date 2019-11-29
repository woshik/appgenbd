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
