"use strict";

const {
	compare
} = require( 'bcryptjs' )
const {
	hashPassword
} = require( join( BASE_DIR, 'core', 'util' ) )
const {
	getDB
} = require( join( BASE_DIR, 'db', 'database' ) )

exports.profileSetting = ( newInfo, id ) => {
	return new Promise( ( resolve, reject ) => {
		getDB().createCollection( 'admin' )
			.then( adminCollection => {
				adminCollection.findOne( {
						_id: id
					}, {
						projection: {
							password: 1
						}
					} )
					.then( admin => {
						if ( !admin ) {
							return resolve( {
								success: false,
								info: 'User not found.'
							} );
						}

						compare( newInfo.current_password, admin.password )
							.then( isMatch => {
								if ( isMatch ) {
									hashPassword( newInfo.new_password )
										.then( passwordHashed => {
											adminCollection.updateOne( {
													_id: id
												}, {
													$set: {
														email: newInfo.email,
														password: passwordHashed,
													}
												} )
												.then( userUpdateValue => {
													return resolve( {
														success: true,
														message: 'Successfully infomations updated.'
													} )
												} )
												.catch( err => reject( err ) )
										} )
										.catch( err => reject( err ) )
								} else {
									console.log( 'ok' )
									return resolve( {
										success: false,
										message: 'Current password is wrong.'
									} )
								}
							} )
							.catch( err => reject( err ) )
					} )
					.catch( err => reject( err ) );
			} )
			.catch( err => reject( err ) );
	} );
}
