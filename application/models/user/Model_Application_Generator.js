"use strict";

const {
	getDB
} = require( join( BASE_DIR, 'db', 'database' ) )

exports.getActiveAppName = id => {
	return new Promise( ( resolve, reject ) => {
		getDB().collection( 'app' ).find( {
				user_id: id,
				app_active: true
			}, {
				_id: 0,
				app_name: 1
			} ).toArray()
			.then( result => resolve( result ) )
			.catch( err => reject( err ) )
	} )
}
