"use strict";

const {
	randomBytes
} = require( 'crypto' )
const dateTime = require( 'date-and-time' )
const {
	sendMail
} = require( join( BASE_DIR, 'core/util' ) )

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
							token_refresh: 1
						}
					} )
					.then( user => {
						if ( !user ) {
							resolve( {
								success: false,
								info: 'Account not found. Try again.'
							} )
						} else if ( user.account_active ) {
							resolve( {
								success: false,
								info: 'Your account already activated.'
							} )
						} else if ( !checkTokenTime( user.token_refresh ) ) {
							generateNewCode( userCollection, user._id )
								.then( updateInfo => {
									sendMail( email, "Varification Code", updateInfo.ops[ 0 ].token ).catch( err => console.log( err ) )
									return resolve( {
										success: true,
										info: null,
										sendCode: 'Please, check your email account.'
									} )
								} )
								.catch( err => reject( err ) )
						} else {
							resolve( {
								success: true,
								info: null
							} )
						}
					} )
					.catch( err => reject( err ) )
			} )
			.catch( err => reject( err ) )
	} )
}

exports.checkCode = ( {
	email,
	rd,
	code
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
							token_refresh: 1,
							token: 1
						}
					} )
					.then( user => {
						if ( !user ) {
							resolve( {
								success: false,
								info: 'Account not found. Try again.'
							} )
						} else if ( user.account_active ) {
							resolve( {
								success: false,
								info: 'Your account already activated.'
							} )
						} else if ( checkTokenTime( user.token_refresh ) ) {
							if ( user.token === code ) {
								userCollection.updateOne( {
										_id: user._id
									}, {
										$set: {
											account_active: true,
											userRDId: null
										}
									} )
									.then( updateInfo => resolve( {
										success: true,
										info: null
									} ) )
									.catch( err => reject( err ) )
							} else {
								resolve( {
									success: false,
									info: 'Please enter valid verification code.'
								} )
							}
						} else {
							generateNewCode( userCollection, user._id )
								.then( updateInfo => {
									sendMail( email, "Varification Code", updateInfo.ops[ 0 ].token ).catch( err => console.log( err ) )
									return resolve( {
										success: false,
										info: 'Please, check your email account again. New code sent.'
									} )
								} )
								.catch( err => reject( err ) )
						}
					} )
					.catch( err => reject( err ) )
			} )
			.catch( err => reject( err ) )
	} )
}

function checkTokenTime( tokenTime ) {
	return ( tokenTime - 60000 ) > dateTime.addHours( new Date(), 6 ).getTime()
}

function generateNewCode( userCollection, id ) {
	return new Promise( ( resolve, reject ) => {
		let now = dateTime.addHours( new Date(), 6 )

		userCollection.updateOne( {
				_id: id
			}, {
				$set: {
					token: randomBytes( 3 ).toString( 'hex' ),
					token_refresh: now.setMinutes( now.getMinutes() + 10 )
				}
			} )
			.then( updateInfo => resolve( updateInfo ) )
			.catch( err => reject( err ) )
	} )
}
