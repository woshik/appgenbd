"use strict";

const {
	getDB
} = require( join( BASE_DIR, 'db', 'database' ) )
const {
	randomBytes
} = require( 'crypto' )

exports.appName = ( appName, userID ) => {
	return new Promise( ( resolve, reject ) => {
		getDB().createCollection( 'app' )
			.then( appCollection => {
				appCollection.findOne( {
						app_name: appName
					}, {
						projection: {
							_id: 1
						}
					} )
					.then( appData => {
						if ( appData ) {
							return resolve( {
								success: false,
								message: "This app name already exist."
							} );
						}

						appCollection.insertOne( {
								user_id: id,
								app_name: appName,
								app_serial: randomBytes( 20 ).toString( 'hex' ),
								create_date_time: dateTime.addHours( new Date(), 6 ),
								app_active: false,
							} )
							.then( appData => {
								getDB().createCollection( 'app' )
									.then( userCollection => {
										userCollection.updateOne( {
											_id: userID
										}, {
											$inc: {
												app_installed: 1
											}
										} )

									} )
									.catch( err => reject( err ) );
							} )
							.catch( err => reject( err ) );
					} )
					.catch( err => reject( err ) );
			} )
			.catch( err => reject( err ) );
	} );
}



// const app = new model( "app" )
//
// app.findOne( {
//         app_name: validateResult.value.appName
//     } )
//     .then( userData => {
//         if ( userData ) {
//             return res.status( 200 ).json( {
//                 success: false,
//                 message: `This app name already exist.`
//             } )
//         }
//
//         let randomSerial = randomBytes( 20 ).toString( 'hex' )
//
//         app.save( {
//                 user_id: req.user._id,
//                 app_name: validateResult.value.appName,
//                 subscribe: 0,
//                 dial: 0,
//                 randomSerial: randomSerial,
//                 create_date: dateTime.addHours( new Date(), 6 ),
//                 app_active: false,
//                 content: []
//             } )
//             .then( dataInsectionResult => {
//                 const user = new model( "users" )
//
//                 user.customUpdateOne( {
//                         _id: req.user._id
//                     }, {
//                         "$inc": {
//                             "app_install": 1
//                         }
//                     } )
//                     .then( userData => {
//                         if ( !userData.result.nModified ) {
//                             return res.json( {
//                                 success: false,
//                                 message: 'Server error. Try again later.'
//                             } )
//                         }
//
//                         return res.json( {
//                             success: true,
//                             message: {
//                                 'ussd': `http://${networkInterfaces.eth0[0].address}/api/${randomSerial}/${validateResult.value.appName}/ussd`,
//                                 'sms': `http://${networkInterfaces.eth0[0].address}/api/${randomSerial}/${validateResult.value.appName}/sms`,
//                                 'url': web.appInstall.url,
//                             }
//                         } )
//                     } )
//                     .catch( err => next( err ) )
//             } )
//             .catch( err => next( err ) )
//     } )
//     .catch( err => next( err ) )
