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
