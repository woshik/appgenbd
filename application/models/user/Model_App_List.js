"use strict";

const {
	getDB
} = require( join( BASE_DIR, 'db', 'database' ) )

exports.getAppList = ( query, id ) => {
	return new Promise( async ( resolve, reject ) => {
		try {
			let order = [ 'app_name', 'app_id', 'subscribe', 'dial', 'create_date', 'app_active' ]
			let sort = {}
			let appCollection = await getDB().createCollection( 'app' )

			if ( query.order ) {
				sort[ order[ parseInt( query.order[ 0 ].column ) ] ] = query.order[ 0 ].dir === 'asc' ? 1 : -1
			} else {
				sort[ order[ 0 ] ] = 1
			}

			let where = {
				user_id: id,
				$or: [ {
					app_name: RegExp( `.*${query.search.value}.*`, 'i' )
					}, {
					app_id: RegExp( `.*${query.search.value}.*`, 'i' )
				} ]
			}

			let appData = await appCollection.find( where, {
				projection: {
					_id: 0,
					user_id: 0,
					app_serial: 0
				},
				skip: parseInt( query.start ),
				limit: parseInt( query.length ),
				sort: sort
			} ).toArray()

			return resolve( {
				list: appData,
				recordsTotal: await appCollection.countDocuments( {
					user_id: id
				} ),
				recordsFiltered: await appCollection.countDocuments( where ),
			} )

		} catch ( err ) {
			return reject( err )
		}
	} )
}

exports.updateAppInfo = ( appInfo, id ) => {
	return new Promise( async ( resolve, reject ) => {
		try {
			let appCollection = await getDB().createCollection( 'app' )

			await appCollection.updateOne( {
				user_id: id,
				app_name: appInfo.appName
			}, {
				$set: {
					app_id: appInfo.appId,
					password: appInfo.appPassword,
					app_active: true
				}
			} )

			return resolve( {
				success: true,
				message: 'Your app is successfully updated'
			} )

		} catch ( err ) {
			return reject( err )
		}
	} )
}

exports.updateAppStatus = ( appInfo, id ) => {
	return new Promise( async ( resolve, reject ) => {
		try {
			let appCollection = await getDB().createCollection( 'app' )



			await appCollection.updateOne( {
				user_id: id,
				app_name: appInfo.appName
			}, {
				$set: {
					app_active: false
				}
			} )

			return resolve( {
				success: true,
				message: 'Your app is successfully updated'
			} )

		} catch ( err ) {
			return reject( err )
		}
	} )
}
