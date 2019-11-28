"use strict";

const {
	accountActivation
} = require( join( BASE_DIR, 'urlconf/webRule' ) )
const {
	randomBytes
} = require( 'crypto' )
const dateTime = require( 'date-and-time' )
const {
	sendMail
} = require( join( BASE_DIR, 'core/util' ) )

exports.checkEmail = email => {
	return new Promise( ( resolve, reject ) => {
		let db = require( join( BASE_DIR, 'db', 'database' ) ).getDB();
		db.createCollection( 'users' )
			.then( userCollection => {
				userCollection.findOne( {
						email: email
					}, {
						projection: {
							account_active: 1,
							token_refresh: 1,
							userRDId: 1
						}
					} )
					.then( user => {
						if ( !user ) {
							resolve( {
								success: false,
								info: 'Account not found.'
							} )
						} else if ( !user.account_active ) {
							resolve( {
								success: false,
								info: `Your account not active. To active your account <a href="${accountActivation.url}?email=${encodeURIComponent(email)}&rd=${user.userRDId}">click here</a>`
							} )
						} else {
							resolve( {
								success: true,
								info: userRDId
							} )
						}
					} )
					.catch( err => reject( err ) );
			} )
			.catch( err => reject( err ) );
	} )
}

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
						if ( !user ) return resolve( {
							success: false,
							info: 'Account not found. Try again.'
						} )

						if ( !user.account_active ) {
							return resolve( {
								success: false,
								info: `Your account not active. To active your account <a href="${accountActivation.url}?email=${encodeURIComponent(email)}&rd=${rd}">click here</a>`
							} )
						}

						let tokenTime = !checkTokenTime( user.token_refresh )

						if ( tokenTime ) generateAndSendNewCode( userCollection, user._id, email )

						return resolve( {
							success: true,
							info: null,
							sendCode: tokenTime ? 'Please, check your email account.' : tokenTime
						} )
					} )
					.catch( err => reject( err ) )
			} )
			.catch( err => reject( err ) )
	} )
}

function checkTokenTime( tokenTime ) {
	return tokenTime > dateTime.addHours( new Date(), 6 ).getTime()
}

function generateAndSendNewCode( resolve, reject, userCollection, id, email ) {
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
		.then()
		.catch( err => console.log( err ) )
}
