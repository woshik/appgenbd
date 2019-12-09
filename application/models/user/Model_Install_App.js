"use strict";

const dateTime = require( 'date-and-time' )
const {
	getDB
} = require( join( BASE_DIR, 'db', 'database' ) )
const {
	randomBytes
} = require( 'crypto' )

exports.insertAppName = ( appName, userID ) => {
	return new Promise( ( resolve, reject ) => {
		getDB().createCollection( 'app' )
			.then( appCollection => {
				appCollection.findOne( {
						app_name: appName
					}, {
						projection: {
							_id: 1
						}
					} )
					.then( appData => {
						if ( appData ) {
							return resolve( {
								success: false,
								info: "This app name already exist."
							} );
						}

						appCollection.insertOne( {
								user_id: userID,
								app_name: appName,
								app_serial: randomBytes( 10 ).toString( 'hex' ),
								create_date_time: dateTime.addHours( new Date(), 6 ),
								app_active: false,
							} )
							.then( appData => {
								getDB().createCollection( 'users' )
									.then( userCollection => {
										userCollection.updateOne( {
												_id: userID
											}, {
												$inc: {
													app_installed: 1
												}
											} )
											.then( userData => resolve( {
												success: true,
												info: {
													serial: appData.ops[ 0 ].app_serial,
													name: appName
												}
											} ) )
											.catch( err => reject( err ) );
									} )
									.catch( err => reject( err ) );
							} )
							.catch( err => reject( err ) );
					} )
					.catch( err => reject( err ) );
			} )
			.catch( err => reject( err ) );
	} );
}

exports.installApp = ( appInfo, userID ) => {
	return new Promise( ( resolve, reject ) => {
		getDB().createCollection( 'app' )
			.then( appCollection => {
				appCollection.findOne( {
						app_id: appInfo.appId
					}, {
						projection: {
							_id: 1
						}
					} )
					.then( appData => {
						if ( appData ) {
							return resolve( {
								success: false,
								info: 'This app id already exist.'
							} );
						}

						appCollection.updateOne( {
								user_id: userID,
								app_name: appInfo.appName
							}, {
								$set: {
									app_id: appInfo.appId,
									password: appInfo.password,
									app_active: true,
								}
							} )
							.then( update => resolve( {
								success: true,
								info: null
							} ) )
							.catch( err => reject( err ) )
					} )
					.catch( err => reject( err ) );
			} )
			.catch( err => reject( err ) );
	} );
}
