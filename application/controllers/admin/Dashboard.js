const {
	hashPassword
} = require( join( BASE_DIR, 'core', 'util' ) )
const web = require( join( BASE_DIR, 'urlconf', 'webRule' ) )
const {
	companyInfo,
	fromErrorMessage
} = require( join( BASE_DIR, 'core', 'util' ) )

exports.dashboardView = ( req, res, next ) => {

	let dashboardData = {
		info: companyInfo,
		title: 'Admin',
		email: req.user.email,
		maxAppCanInstall: '',
		costPerMonth: '',
		appSettingId: '',
		csrfToken: req.csrfToken(),
		userList: web.userList.url,
		userPayment: web.payment.url,
		userAccountStatusChange: web.accountStatusChange.url,
		userAccountDelete: web.accountDelete.url,
		appSetting: web.appSetting.url,
		profileSetting: web.profileSetting.url,
		maxAppInstallUrl: web.userMaxAppInstall.url,
	}

	if ( req.user.setting ) {
		dashboardData.appSettingId = req.user.setting._id
		dashboardData.maxAppCanInstall = req.user.setting.max_app
		dashboardData.costPerMonth = req.user.setting.cost_per_month
	}

	res.render( "admin/dashboard", dashboardData )
}

exports.adminLogout = ( req, res ) => {
	req.logout()
	req.flash( 'adminLoginScreenSuccessMessage', 'Successfully Logout' )
	res.redirect( web.adminLogin.url )
}

exports.profileSetting = ( req, res, next ) => {
	const schema = Joi.object( {
		email: Joi.string().trim().email().required().label( "Email address" ),
		password: Joi.string().trim().min( 5 ).max( 50 ).required().label( "Password" ),
		confirm_password: Joi.ref( "password" )
	} )

	const validateResult = schema.validate( {
		email: req.body.email,
		password: req.body.password,
		confirm_password: req.body.confirm_password
	} )

	if ( validateResult.error ) {
		return res.status( 200 ).json( {
			success: false,
			message: fromErrorMessage( validateResult.error.details[ 0 ] )
		} )
	}

	hashPassword( validateResult.value.password )
		.then( passwordHashed => {
			let adminInfo = {
				'email': validateResult.value.email,
				'password': passwordHashed,
			}

			let admin = new model( 'admin' )
			admin.updateOne( {
					_id: req.user._id
				}, adminInfo )
				.then( adminUpdateValue => {
					if ( !adminUpdateValue.result.nModified ) {
						return res.status( 200 ).json( {
							success: false,
							message: 'Server Error. Please try again later.'
						} )
					}

					return res.status( 200 ).json( {
						success: true,
						message: 'Successfully updated infomations.'
					} )
				} )
				.catch( err => next( err ) )
		} )
		.catch( err => next( err ) )
}
