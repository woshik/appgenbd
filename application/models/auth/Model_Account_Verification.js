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
							generateAndSendNewCode( resolve, reject, userCollection, user._id, email, {
								success: true,
								info: null,
								sendCode: 'Please, check your email account.'
							} )
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
											userRDId: randomBytes( 4 ).toString( 'hex' )
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
							generateAndSendNewCode( userCollection, user._id, email, {
								success: false,
								info: 'Please, check your email account again. New code sent.'
							} )
						}
					} )
					.catch( err => reject( err ) )
			} )
			.catch( err => reject( err ) )
	} )
}

function checkTokenTime( tokenTime ) {
	return tokenTime > dateTime.addHours( new Date(), 6 ).getTime()
}

function generateAndSendNewCode( resolve, reject, userCollection, id, email, response ) {
	let now = dateTime.addHours( new Date(), 6 ),
		token = randomBytes( 3 ).toString( 'hex' )

	sendMail( email, "Varification Code", token ).catch( err => console.log( err ) )

	userCollection.updateOne( {
			_id: id
		}, {
			$set: {
				token: token,
				token_refresh: now.setMinutes( now.getMinutes() + 10 )
			}
		} )
		.then( updateInfo => resolve( response ) )
		.catch( err => reject( err ) )
}
