"use strict";

const Joi = require( '@hapi/joi' )
const entities = new( require( 'html-entities' ).AllHtmlEntities )();
const dateTime = require( 'date-and-time' )
const web = require( join( BASE_DIR, 'urlconf', 'webRule' ) )
const {
	user
} = require( join( BASE_DIR, 'urlconf', 'sideBar' ) )
const {
	companyInfo,
	fromErrorMessage
} = require( join( BASE_DIR, 'core', 'util' ) )
const {
	checkAppIsActive,
	contentUpload
} = require( join( MODEL_DIR, 'user/Model_Content_Upload' ) )
const {
	getDB
} = require( join( BASE_DIR, 'db', 'database' ) )

exports.contentUploadView = ( req, res, next ) => {
	checkAppIsActive( req.query.appname, req.user._id )
		.then( success => {
			if ( success ) {
				return res.render( "user/base-template", {
					layout: 'content-upload',
					info: companyInfo,
					title: 'Content Upload',
					path: '/user/app-list',
					sidebar: user,
					csrfToken: req.csrfToken(),
					userName: req.user.name,
					email: req.user.email,
					appName: req.query.appname,
					contentUploadFormURL: web.contentUpload.url,
					userProfileSettingURL: web.userProfileSetting.url,
				} );
			} else {
				req.flash( 'appListPageMessage', 'App not found.' )
				return res.redirect( web.appList.url )
			}
		} )
		.catch( err => next( err ) )
};

exports.contentUpload = async ( req, res, next ) => {
	let message = req.body.messageContent
	let messageDateTime = req.body.dateTime
	let position = req.body.position

	if ( typeof message === "undefined" || typeof messageDateTime === "undefined" || typeof position === "undefined" ) {
		return res.json( {
			success: false,
			message: "Please don't edit anything yourself, you will be back listed."
		} )
	}

	if ( typeof position === "string" ) {
		message = [ message ]
		messageDateTime = [ messageDateTime ]
		position = [ position ]
	}

	if ( ( message.length === messageDateTime.length ) && ( messageDateTime.length === position.length ) ) {
		let length = message.length

		var clientResponse = []
		var appCollection = await getDB().createCollection( 'app' )

		for ( let i = 0; i < length; i++ ) {

			let result = new Promise( ( response, reject ) => {
				const schema = Joi.object( {
					messageDateTime: Joi.string().trim().required().pattern( /^[0-3][0-9]-[0-1][0-9]-20[0-9]{2} [0-1][0-9]:00 (am|pm)$/ ).label( "Message receiving date time" ),
					content: Joi.string().trim().required().label( "Message content" )
				} )

				const validateResult = schema.validate( {
					messageDateTime: messageDateTime[ i ],
					content: entities.encode( message[ i ] )
				} )

				if ( validateResult.error ) {
					return response( {
						success: false,
						position: parseInt( position[ i ] ),
						message: fromErrorMessage( validateResult.error.details[ 0 ] )
					} )
				}

				let splitDateTime = messageDateTime[ i ].split( " " )
				let splitDate = splitDateTime[ 0 ].split( "-" )

				if ( dateTime.subtract( new Date( `${splitDate[2]}-${splitDate[1]}-${splitDate[0]} ${splitDateTime[1]}` ), dateTime.addHours( new Date(), 6 ) ).toDays() <= 0 ) {
					return response( {
						success: false,
						position: parseInt( position[ i ] ),
						message: 'You have to select a date which is grater than today.'
					} )
				}

				appCollection.aggregate( [ {
						$match: {
							user_id: req.user._id,
							app_name: req.body.appname,
						}
					}, {
						$project: {
							_id: 0,
							content: {
								$filter: {
									input: "$content",
									as: "content",
									cond: {
										$eq: [ "$$content.date", splitDateTime[ 0 ] ]
									}
								}
							},
						}
					} ] ).toArray()
					.then( content => {
						if ( content === [] ) {
							return response( {
								success: false,
								position: parseInt( position[ i ] ),
								message: "Please don't edit anything yourself, you will be back listed"
							} )
						}

						content = content[ 0 ].content
						if ( content && content.length === 1 ) {
							return response( {
								success: false,
								position: parseInt( position[ i ] ),
								message: `Already you uploaded a message for ${splitDateTime[0]}`
							} )
						}

						appCollection.updateOne( {
								user_id: req.user._id,
								app_name: req.body.appname,
							}, {
								$push: {
									content: {
										$each: [ {
											date: splitDateTime[ 0 ],
											time: `${splitDateTime[1]} ${splitDateTime[2]}`,
											message: validateResult.value.content
										} ],
										$sort: {
											date: 1,
											time: 1
										}
									}
								}
							} )
							.then( updateValue => {
								if ( !updateValue.result.nModified ) {
									return response( {
										success: false,
										position: parseInt( position[ i ] ),
										message: 'Server error. Plase try again later.'
									} )
								}

								response( {
									success: true,
									position: parseInt( position[ i ] ),
								} )
							} )
							.catch( err => next( err ) )
					} )
					.catch( err => next( err ) )
			} )

			await result.then( data => {
					clientResponse.push( data )
				} )
				.catch( err => next( err ) )
		}

		return res.json( clientResponse )
	} else {
		return res.json( {
			success: false,
			message: "Please don't edit anything yourself, you will be back listed."
		} )
	}
}
