"use strict";

const dateTime = require( 'date-and-time' )
const {
	randomBytes
} = require( 'crypto' )
const {
	sendMail
} = require( join( BASE_DIR, 'core/util' ) )
const {
	getDB
} = require( join( BASE_DIR, 'db', 'database' ) )

exports.checkUser = ( email, rd ) => {
	return new Promise( ( resolve, reject ) => {
		getDB().createCollection( 'users' )
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
							return resolve( {
								success: false,
								info: 'Account not found. Try again.'
							} )
						} else if ( user.account_active ) {
							return resolve( {
								success: false,
								info: 'Your account already activated.'
							} )
						} else if ( !checkTokenTime( user.token_refresh ) ) {
							return generateNewCode( userCollection, user._id )
								.then( token => {
									sendMail( email, "Varification Code", token ).catch( err => console.log( err ) )
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

exports.checkCode = ( email, rd, code ) => {
	return new Promise( ( resolve, reject ) => {
		getDB().createCollection( 'users' )
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
										},
										$unset: {
											userRDId: 1,
											token: 1,
											token_refresh: 1
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
								.then( token => {
									sendMail( email, "Varification Code", token ).catch( err => console.log( err ) )
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
	return tokenTime > dateTime.addHours( new Date(), 6 ).getTime()
}

function generateNewCode( userCollection, id ) {
	return new Promise( ( resolve, reject ) => {
		let now = dateTime.addHours( new Date(), 6 ),
			token = randomBytes( 3 ).toString( 'hex' )

		userCollection.updateOne( {
				_id: id
			}, {
				$set: {
					token: token,
					token_refresh: now.setMinutes( now.getMinutes() + 10 )
				}
			} )
			.then( updateInfo => resolve( token ) )
			.catch( err => reject( err ) )
	} )
}
