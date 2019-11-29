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
							if ( user.userRDId && checkRDParam( user.userRDId ) ) {
								return resolve( {
									success: false,
									info: `Your account not active. To active your account <a href="${accountActivation.url}?email=${encodeURIComponent(email)}&rd=${user.userRDId}">click here</a>`
								} )
							} else {
								updateRDParam( userCollection, user._id )
									.then( updateInfo => {
										return resolve( {
											success: false,
											info: `Your account not active. To active your account <a href="${accountActivation.url}?email=${encodeURIComponent(email)}&rd=${updateInfo.ops[ 0 ].userRDId}">click here</a>`
										} )
									} )
									.catch( err => reject( err ) )
							}
						} else {
							if ( user.userRDId && checkRDParam( user.userRDId ) ) {
								return resolve( {
									success: true,
									info: user.userRDId
								} )
							} else {
								updateRDParam( userCollection, user._id )
									.then( updateInfo => {
										return resolve( {
											success: true,
											info: updateInfo.ops[ 0 ].userRDId
										} )
									} )
									.catch( err => reject( err ) )
							}
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
						if ( !user ) {
							return resolve( {
								success: false,
								info: 'Account not found. Try again.'
							} )
						} else if ( !user.account_active ) {
							if ( checkRDParam( rd ) ) {
								return resolve( {
									success: false,
									info: `Your account not active. To active your account <a href="${accountActivation.url}?email=${encodeURIComponent(email)}&rd=${rd}">click here</a>`
								} )
							} else {
								updateRDParam( userCollection, user._id )
									.then( updateInfo => {
										return resolve( {
											success: false,
											info: `Your account not active. To active your account <a href="${accountActivation.url}?email=${encodeURIComponent(email)}&rd=${updateInfo.ops[ 0 ].token}">click here</a>`
										} )
									} )
									.catch( err => reject( err ) )
							}
						} else if ( !checkTokenTime( user.token_refresh ) ) {
							generateNewCode( userCollection, user._id )
								.then( updateInfo => {

									sendMail( email, "Varification Code", updateInfo.ops[ 0 ].token ).catch( err => console.log( err ) )

									if ( checkRDParam( rd ) ) {
										updateRDParam( userCollection, user._id )
											.then( updateInfo => {
												return resolve( {
													success: true,
													info: null,
												} )
											} )
											.catch( err => reject( err ) )
									}

									return resolve( {
										success: true,
										info: null,
									} )
								} )
								.catch( err => reject( err ) )
						} else {
							return resolve( {
								success: true,
								info: null,
							} )
						}
					} )
					.catch( err => reject( err ) )
			} )
			.catch( err => reject( err ) )
	} )
}

function checkRDParam( rd ) {
	let now = dateTime.addHours( new Date(), 6 )
	return rd.slice( 15 ) > now.getTime() && rd.slice( 8, 15 ) === `${dateTime.format(now, 'DD')}ace${dateTime.format(now, 'MM')}`
}

function updateRDParam( userCollection, id ) {
	return new Promise( ( resolve, reject ) => {
		let now = dateTime.addHours( new Date(), 6 )

		userCollection.updateOne( {
				_id: id
			}, {
				$set: {
					userRDId: `${randomBytes( 4 ).toString( 'hex' )}${dateTime.format(now, 'DD')}ace${dateTime.format(now, 'MM')}${now.setMinutes( now.getMinutes() + 30 )}`,
				}
			} )
			.then( updateInfo => resolve( updateInfo ) )
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
