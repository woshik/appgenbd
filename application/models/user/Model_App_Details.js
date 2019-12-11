"use strict";

const {
	getDB
} = require( join( BASE_DIR, 'db', 'database' ) )

exports.checkAppIsActive = ( appName, id ) => {
	return new Promise( async ( resolve, reject ) => {
		getDB().collection( 'app' ).findOne( {
				user_id: id,
				app_name: appName,
				app_active: true
			}, {
				_id: 1,
				app_serial: 1
			} )
			.then( result => resolve( !!result ? {
				success: true,
				info: result
			} : false ) )
			.catch( err => reject( err ) )
	} )
}
