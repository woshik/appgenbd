"use strict";

const Joi = require( '@hapi/joi' )
const entities = new( require( 'html-entities' ).AllHtmlEntities )();
const {
	format
} = require( 'date-and-time' )
const web = require( join( BASE_DIR, 'urlconf', 'webRule' ) )
const {
	user
} = require( join( BASE_DIR, 'urlconf', 'sideBar' ) )
const {
	companyInfo,
	fromErrorMessage
} = require( join( BASE_DIR, 'core', 'util' ) )
const {
	getAppList,
	updateAppInfo
} = require( join( MODEL_DIR, 'user/Model_App_List' ) )

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
		appInfoUpdateUrl: web.appdInfoUpdate.url,
		appStatusChangeUrl: web.appStatusChange.url,
		userProfileSettingURL: web.userProfileSetting.url,
	} )
}

exports.appList = ( req, res, next ) => {

	getAppList( req.body, req.user._id )
		.then( appList => {
			let response = []
			appList.list.map( ( appData ) => {

				let actionBtn = ( !!appData.app_id && !!appData.password ) ? appData.app_active ? `
						<a href="${web.appdetails.url}?appname=${appData.app_name}" title="Details" class="btn btn-primary btn-icon" >
							<i class="fas fa-eye"></i>
						</a>
						<a href="${web.contentUpload.url}?appname=${appData.app_name}" title="Message upload" class="btn btn-primary btn-icon">
							<i class="fas fa-cloud-upload-alt"></i>
						</a>
						` : '' : `
						<a href="javascript:void(0)" title="Update App Information" class="btn btn-primary btn-icon" type="button" data-toggle="modal" data-target="#updateAppInfoModal" onclick="appInfoUpdate('${appData.app_name}')" data-backdrop="static">
							<i class="fas fa-file-invoice"></i>
						</a>`

				actionBtn += ( !!appData.app_id && !!appData.password ) ? appData.app_active ? `
									<a href="javascript:void(0)" class="btn btn-danger btn-icon" type="button" data-toggle="modal" data-target="#appStatusChangeModal" title="Deactivate Your App" onclick="appStatusChange('${appData.app_name}')" data-backdrop="static">
										<i class="fas fa-toggle-off"></i>
									</a>
									` : `
									<a href="javascript:void(0)" class="btn btn-success btn-icon" type="button" data-toggle="modal" data-target="#appStatusChangeModal" title="Activate Your App" onclick="appStatusChange('${appData.app_name}')" data-backdrop="static">
										<i class="fas fa-toggle-on"></i>
									</a>` : '';

				response.push( [
					appData.app_name,
					appData.app_id,
					appData.subscribe || 0,
					appData.dial || 0,
					format( appData.create_date_time, "DD-MM-YYYY hh:mm:ss A" ),
					appData.app_active ? '<i class="far fa-check-circle correct"></i>' : '<i class="far fa-times-circle wrong"></i>',
					actionBtn
				] )
			} )

			return res.json( {
				data: response,
				recordsTotal: appList.recordsTotal,
				recordsFiltered: appList.recordsFiltered
			} )
		} )
		.catch( err => next( err ) )

}

exports.appUpdate = ( req, res, next ) => {
	const schema = Joi.object( {
		appId: Joi.string().trim().required().label( "App Id" ),
		appPassword: Joi.string().trim().required().label( "Password" ),
		appName: Joi.string().trim().pattern( /^[a-zA-Z0-9_-\s]+$/ ).required().label( "App Name" ),
	} )

	const validateResult = schema.validate( {
		appId: entities.encode( req.body.appId ),
		appPassword: entities.encode( req.body.appPassword ),
		appName: req.body.appName
	} )

	if ( validateResult.error ) {
		return res.json( {
			success: false,
			message: fromErrorMessage( validateResult.error.details[ 0 ] )
		} )
	}

	updateAppInfo( validateResult.value, req.user._id ).then( result => res.json( result ) ).catch( err => next( err ) )
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
