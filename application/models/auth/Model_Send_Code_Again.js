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
							resolve( {
								info: 'Account not found. Try again.'
							} )
						} else if ( checkTokenTime( user.token_refresh ) ) {
							resolve( {
								info: 'Your code already send to your email account. Please check.'
							} )
						} else {
							generateNewCode( userCollection, user._id )
								.then( token => {
									sendMail( email, "Varification Code", token ).catch( err => console.log( err ) )
									return resolve( {
										info: 'Please, check your email account. New code sent.'
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
