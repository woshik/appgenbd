"use strict";

const dateTime = require( 'date-and-time' )

exports.checkUser = ( {
	email,
	rd
} ) => {
	return new Promise( ( resolve, reject ) => {
		let db = require( join( BASE_DIR, 'db', 'database' ) ).getDB()
		db.createCollection( 'users' )
			.then( userCollection => {
				userCollection.findOne( {
						email: email,
						userRDId: rd
					}, {
						projection: {
							account_active: 1,
							forget_password: 1
						}
					} )
					.then( user => {
						if ( !user ) {
							return resolve( {
								success: false,
								info: 'Account not found. Try again.'
							} )
						} else if ( !user.account_active ) {
							return resolve( {
								success: false,
								info: 'Your account not activated.'
							} )
						} else if ( checkForgetPasswordTime( user.forget_password ) ) {
							return resolve( {
								success: true,
								info: null
							} )
						} else {
							return resolve( {
								success: false,
								info: 'Invalid request.'
							} )
						}
					} )
					.catch( err => reject( err ) )
			} )
			.catch( err => reject( err ) )
	} )
}

function checkForgetPasswordTime( time ) {
	return time > dateTime.addHours( new Date(), 6 ).getTime()
}
