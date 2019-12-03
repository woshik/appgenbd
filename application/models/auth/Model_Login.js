"use strict";

const dateTime = require( 'date-and-time' )
const {
	randomBytes
} = require( 'crypto' )
const {
	compare
} = require( 'bcryptjs' )
const {
	accountActivation
} = require( join( BASE_DIR, 'urlconf/webRule' ) )
const {
	ObjectId
} = require( 'mongodb' )
const {
	getDB
} = require( join( BASE_DIR, 'db', 'database' ) )


exports.user = ( email, password ) => {
	return new Promise( ( resolve, reject ) => {
		getDB().createCollection( 'users' )
			.then( userCollection => {
				userCollection.findOne( {
						email: email
					}, {
						projection: {
							password: 1,
							account_active: 1,
							userRDId: 1
						}
					} )
					.then( user => {
						if ( !user ) {
							return resolve( {
								success: false,
								info: 'Your email address not registered.'
							} )
						}

						compare( password, user.password )
							.then( isMatch => {
								if ( isMatch ) {
									if ( !!user.account_active ) {
										if ( !!user.account_disable ) {
											return resolve( {
												success: false,
												info: 'Your account is disabled. Please contact with admin.'
											} )
										} else {
											return resolve( {
												success: true,
												info: {
													id: user._id,
													role: 'user'
												}
											} )
										}
									} else {
										if ( !!user.userRDId && checkRDParam( user.userRDId ) ) {
											return resolve( {
												success: false,
												info: `Your account not active. To active your account <a href="${accountActivation.url}?email=${encodeURIComponent(email)}&rd=${user.userRDId}">click here</a>`
											} )
										} else {
											updateRDParam( userCollection, user._id )
												.then( rd => {
													return resolve( {
														success: false,
														info: `Your account not active. To active your account <a href="${accountActivation.url}?email=${encodeURIComponent(email)}&rd=${rd}">click here</a>`
													} )
												} )
												.catch( err => reject( err ) )
										}
									}
								} else {
									return resolve( {
										success: false,
										info: "Password doesn't match."
									} )
								}
							} )
							.catch( err => reject( err ) )
					} )
					.catch( err => reject( err ) )
			} )
			.catch( err => reject( err ) )
	} )
}

exports.admin = ( email, password ) => {
	return new Promise( ( resolve, reject ) => {
		getDB().createCollection( 'admin' )
			.then( adminCollection => {
				adminCollection.findOne( {
						email: email
					} )
					.then( admin => {
						if ( !userData ) return done( null, false, {
							message: "Email address not register"
						} )
						bcrypt.compare( password, userData.password )
							.then( isMatch => {
								if ( isMatch ) {
									return resolve( {
										successs: true,
										info: {
											id: user._id,
											role: 'admin'
										}
									} )
								} else {
									return resolve( {
										successs: false,
										info: "Password doesn't match"
									} )
								}
							} )
							.catch( err => reject( err ) )
					} )
					.catch( err => reject( err ) )
			} )
			.catch( err => reject( err ) )
	} )
}

exports.login = ( {
	id,
	role
} ) => {
	return new Promise( ( resolve, reject ) ) => {
		getDB().createCollection( role === "user" ? "users" : "admin" )
			.then( collection => {
				collection.findOne( {
						_id: id
					}, {
						name: 1,
						number: 1,
						email: 1,
						account_activation_end_date: 1,
						max_app_can_install: 1,
						app_installed: 1,
					} )
					.then( data => {
						if ( !data ) {
							return done( null, false )
						} else if ( role === "user" ) {
							data.is_account_limit_available = dateTime.subtract( new Date( data.account_activation_end_date ), dateTime.addHours( new Date(), 6 ) ).toDays() >= 0
						} else if ( role === "admin" ) {
							getDB().createCollection( "setting" )
								.then( settingCollection => {
									settingCollection.find()
										.then( settingData => {
											data.setting = ( !!settingData && settingData.length === 1 ) ? settingData[ 0 ] : null;
										} )
										.catch( err => reject( err ) )
								} )
								.catch( err => reject( err ) )
						}

						resolve( data )
					} )
					.catch( err => reject( err ) )
			} )
			.catch( err => reject( err ) )
	}
}

function checkRDParam( rd ) {
	let now = dateTime.addHours( new Date(), 6 )
	return rd.slice( 15 ) > now.getTime() && rd.slice( 8, 15 ) === `${dateTime.format(now, 'DD')}ace${dateTime.format(now, 'MM')}`
}

function updateRDParam( userCollection, id ) {
	return new Promise( ( resolve, reject ) => {
		let now = dateTime.addHours( new Date(), 6 ),
			rd = `${randomBytes( 4 ).toString( 'hex' )}${dateTime.format(now, 'DD')}ace${dateTime.format(now, 'MM')}${now.setMinutes( now.getMinutes() + 30 )}`

		userCollection.updateOne( {
				_id: id
			}, {
				$set: {
					userRDId: rd,
				}
			} )
			.then( updateInfo => resolve( rd ) )
			.catch( err => reject( err ) )
	} )
}
