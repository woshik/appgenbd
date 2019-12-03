const web = require( join( BASE_DIR, 'urlconf', 'webRule' ) )
const {
	randomBytes
} = require( 'crypto' )
const {
	user
} = require( join( BASE_DIR, 'urlconf', 'sideBar' ) )
const {
	companyInfo,
	fromErrorMessage
} = require( join( BASE_DIR, 'core', 'util' ) )
const networkInterfaces = require( 'os' ).networkInterfaces()

exports.installAppView = ( req, res, next ) => {
	res.render( "user/base-template", {
		layout: 'install-app',
		info: companyInfo,
		title: 'Install App',
		path: req.path,
		sidebar: user,
		csrfToken: req.csrfToken(),
		userName: req.user.name,
		email: req.user.email,
		installAppFormURL: web.appName.url,
	} )
}

exports.appName = ( req, res, next ) => {
	const schema = Joi.object( {
		appName: Joi.string().trim().pattern( /^[a-zA-Z0-9_-\s]+$/ ).required().label( "App Name" ),
	} )

	const validateResult = schema.validate( {
		appName: req.body.appName,
	} );

	if ( validateResult.error ) {
		return res.json( {
			success: false,
			message: fromErrorMessage( validateResult.error.details[ 0 ] )
		} )
	} else if ( !!req.user.max_app_can_install ) {
		return res.json( {
			success: false,
			message: 'Please, first pay your bill. Your are now using trial version.'
		} )
	} else if ( req.user.max_app_install === req.user.app_install ) {
		return res.json( {
			success: false,
			message: `Your already installed ${req.user.app_install} app.`
		} )
	}

	const app = new model( "app" )

	app.findOne( {
			app_name: validateResult.value.appName
		} )
		.then( userData => {
			if ( userData ) {
				return res.status( 200 ).json( {
					success: false,
					message: `This app name already exist.`
				} )
			}

			let randomSerial = randomBytes( 20 ).toString( 'hex' )

			app.save( {
					user_id: req.user._id,
					app_name: validateResult.value.appName,
					subscribe: 0,
					dial: 0,
					randomSerial: randomSerial,
					create_date: dateTime.addHours( new Date(), 6 ),
					app_active: false,
					content: []
				} )
				.then( dataInsectionResult => {
					const user = new model( "users" )

					user.customUpdateOne( {
							_id: req.user._id
						}, {
							"$inc": {
								"app_install": 1
							}
						} )
						.then( userData => {
							if ( !userData.result.nModified ) {
								return res.json( {
									success: false,
									message: 'Server error. Try again later.'
								} )
							}

							return res.json( {
								success: true,
								message: {
									'ussd': `http://${networkInterfaces.eth0[0].address}/api/${randomSerial}/${validateResult.value.appName}/ussd`,
									'sms': `http://${networkInterfaces.eth0[0].address}/api/${randomSerial}/${validateResult.value.appName}/sms`,
									'url': web.appInstall.url,
								}
							} )
						} )
						.catch( err => next( err ) )
				} )
				.catch( err => next( err ) )
		} )
		.catch( err => next( err ) )
};

exports.installApp = ( req, res, next ) => {
	const schema = Joi.object( {
		appName: Joi.string().trim().required().label( "App Name" ),
		appId: Joi.string().trim().label( "App Id" ),
		password: Joi.string().trim().label( "Password" ),
	} )

	const validateResult = schema.validate( {
		appName: req.body.appName,
		appId: req.body.appId,
		password: req.body.appPassword
	} )

	if ( validateResult.error ) {
		return res.status( 200 ).json( {
			success: false,
			message: fromErrorMessage( validateResult.error.details[ 0 ] )
		} )
	}

	if ( req.user.max_app_install === 0 ) {
		return res.status( 200 ).json( {
			success: false,
			message: 'Please, first pay your bill. Your are now using trial version.'
		} )
	}

	if ( req.user.max_app_install === req.user.app_install ) {
		return res.status( 200 ).json( {
			success: false,
			message: `Your already install ${req.user.app_install} app`
		} )
	}

	const app = new model( "app" );

	app.findOne( {
			app_id: validateResult.value.appId
		}, {
			_id: 1
		} )
		.then( appInfo => {
			if ( appInfo ) {
				return res.status( 200 ).json( {
					success: false,
					message: 'This app id already exist.'
				} );
			}

			app.updateOne( {
					user_id: req.user._id,
					app_name: validateResult.value.appName
				}, {
					'app_id': validateResult.value.appId,
					'password': validateResult.value.password,
					'app_active': true,
				} )
				.then( updateData => {
					if ( !updateData.result.nModified ) {
						return res.status( 200 ).json( {
							success: false,
							message: 'Your app not found.'
						} )

					}
					return res.status( 200 ).json( {
						success: true,
						message: {
							msg: 'Your app is successfully installed',
							url: web.appName.url
						}
					} )
				} )
				.catch( err => next( err ) )
		} )
		.catch( err => next( err ) )
}
