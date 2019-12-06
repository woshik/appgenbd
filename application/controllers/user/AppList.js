const Joi = require( '@hapi/joi' )
const web = require( join( BASE_DIR, 'urlconf', 'webRule' ) )
const {
	user
} = require( join( BASE_DIR, 'urlconf', 'sideBar' ) )
const {
	companyInfo,
	fromErrorMessage
} = require( join( BASE_DIR, 'core', 'util' ) )

exports.appListView = ( req, res, next ) => {

	res.render( "user/base-template", {
		layout: 'app-list',
		info: companyInfo,
		title: 'App List',
		path: req.path,
		sidebar: user,
		csrfToken: req.csrfToken(),
		userName: req.user.name,
		email: req.user.email,
		flashMessage: req.flash( 'appListPageMessage' ),
		appListUrl: web.appList.url,
		appInfoUpdateUrl: web.appdInfoUpdate.url,
		appStatusChangeUrl: web.appStatusChange.url,
		userProfileSettingURL: web.userProfileSetting.url,
	} )
}

exports.appList = ( req, res, next ) => {
	const app = new model( "app" )
	let order = [ 'app_name', 'app_id', 'subscribe', 'dial', 'create_date', 'app_active' ]
	let sort = {}

	if ( req.body.order ) {
		sort[ order[ parseInt( req.body.order[ 0 ].column ) ] ] = req.body.order[ 0 ].dir === 'asc' ? 1 : -1
	} else {
		sort[ order[ 0 ] ] = 1
	}

	app.dataTable( {
			user_id: req.user._id,
			$or: [
				{
					app_name: RegExp( `.*${req.body.search.value}.*`, 'i' )
				},
				{
					app_id: RegExp( `.*${req.body.search.value}.*`, 'i' )
				},
            ]
		}, {
			_id: 0,
			user_id: 0,
			randomSerial: 0,
		}, parseInt( req.body.start ), parseInt( req.body.length ), sort )
		.then( result => {
			let response = []
			result.data.map( ( appData ) => {

				let actionBtn = ( !!appData.app_id && !!appData.password ) ? appData.app_active ? `
                <a href="${web.appdetails.url.replace(':appName', appData.app_name)}" title="Details" class="btn btn-primary btn-icon" >
                    <i class="fas fa-eye"></i>
                </a>
                <a href="${web.contentUpload.url.replace(':appName', appData.app_name)}" title="Message upload" class="btn btn-primary btn-icon">
                    <i class="fas fa-cloud-upload-alt"></i>
                </a>
                ` : '' : `
                <a href="javascript:void(0)" title="Update App Information" class="btn btn-primary btn-icon" type="button" data-toggle="modal" data-target="#updateAppInfo" onclick="appInfoUpdate('${appData.app_name}')" data-backdrop="static">
                    <i class="fas fa-file-invoice"></i>
                </a>`

				actionBtn += ( !!appData.app_id && !!appData.password ) ? appData.app_active ? `
                            <a href="javascript:void(0)" class="btn btn-danger btn-icon" type="button" data-toggle="modal" data-target="#appStatusChange" title="Deactivate Your App" onclick="appStatusChange('${appData.app_name}')" data-backdrop="static">
                                <i class="fas fa-toggle-off"></i>
                            </a>
                            ` : `
                            <a href="javascript:void(0)" class="btn btn-success btn-icon" type="button" data-toggle="modal" data-target="#appStatusChange" title="Activate Your App" onclick="appStatusChange('${appData.app_name}')" data-backdrop="static">
                                <i class="fas fa-toggle-on"></i>
                            </a>` :
					'';

				response.push( [
                    appData.app_name,
                    appData.app_id,
                    appData.subscribe,
                    appData.dial,
                    dateTime.format( appData.create_date, "DD-MM-YYYY hh:mm:ss A" ),
                    appData.app_active ? '<i class="far fa-check-circle correct"></i>' : '<i class="far fa-times-circle wrong"></i>',
                    actionBtn
                ] )
			} )

			return res.status( 200 ).json( {
				data: response,
				recordsTotal: result.recordsTotal,
				recordsFiltered: result.recordsFiltered,
				draw: parseInt( req.body.draw ),
			} )
		} )
		.catch( err => next( err ) )
}

exports.appUpdate = ( req, res, next ) => {
	const schema = Joi.object( {
		appId: Joi.string().trim().label( "App Id" ),
		password: Joi.string().trim().label( "Password" ),
	} )

	const validateResult = schema.validate( {
		appId: req.body.appId,
		password: req.body.password
	} )

	if ( validateResult.error ) {
		return res.status( 200 ).json( {
			success: false,
			message: fromErrorMessage( validateResult.error.details[ 0 ] )
		} )
	}

	const app = new model( "app" )
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
				} )
			}
			app.updateOne( {
					user_id: req.user._id,
					app_name: req.body.appName,
					app_active: false
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
						message: 'Your app is successfully updated'
					} )
				} )
				.catch( err => next( err ) )
		} )
		.catch( err => next( err ) )
}

exports.getAppStatus = ( req, res, next ) => {
	let app = new model( 'app' )
	app.findOne( {
			user_id: req.user._id,
			app_name: req.query.appName
		}, {
			app_active: 1,
			_id: 0
		} )
		.then( appInfo => {
			if ( !appInfo ) {
				return res.json( {
					success: false,
					message: 'Your app not found.'
				} )
			}

			return res.json( {
				success: true,
				appActive: appInfo.app_active
			} )
		} )
		.catch( err => next( err ) )
}

exports.appStatusChange = ( req, res, next ) => {
	let app = new model( 'app' )
	app.findOne( {
			user_id: req.user._id,
			app_name: req.body.appName
		}, {
			app_active: 1,
			app_id: 1,
			password: 1,
			_id: 0
		} )
		.then( appInfo => {
			if ( !appInfo || !appInfo.app_id || !appInfo.password ) {
				return res.json( {
					success: false,
					message: 'Your app not found.'
				} )
			}

			app.updateOne( {
					user_id: req.user._id,
					app_id: appInfo.app_id
				}, {
					'app_active': !appInfo.app_active
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
						message: `Your app is successfully ${appInfo.app_active?'deactivated':'activated'}.`
					} )
				} )
				.catch( err => next( err ) )

		} )
		.catch( err => next( err ) )
}
