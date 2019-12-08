"use strict";

const {
	getDB
} = require( join( BASE_DIR, 'db', 'database' ) )

exports.payment = ( paymentInfo, id ) => {
	return new Promise( ( resolve, reject ) => {
		getDB().createCollection( 'users' )
			.then( userCollection => {
				try {
					let setingData = getDB().collection( 'setting' ).findOne( {} )
				} catch ( err ) {
					return reject( err )
				}
			} )
			.catch( err => reject( err ) )
	} )
}

// if ( validateResult.error ) {
// 	return res.json( {
// 		success: false,
// 		message: fromErrorMessage( validateResult.error.details[ 0 ] )
// 	} )
// }
//
// if ( validateResult.value.userMaxApp % req.user.setting.max_app !== 0 ) {
// 	return res.status( 200 ).json( {
// 		success: false,
// 		message: 'Please, enter correct app package.'
// 	} )
// }
//
// if ( ( ( validateResult.value.userMaxApp / req.user.setting.max_app ) * req.user.setting.cost_per_month ) !== validateResult.value.ammount ) {
// 	return res.status( 200 ).json( {
// 		success: false,
// 		message: 'Payment ammount isn\'t correct.'
// 	} )
// }
//
// try {
// 	var id = ObjectId( req.body.id )
// } catch ( err ) {
// 	return res.status( 200 ).json( {
// 		success: false,
// 		message: 'Please, don\'t violate the process.'
// 	} )
// }
//
// let user = new model( 'users' )
// user.findOne( {
// 		_id: id
// 	} )
// 	.then( userData => {
// 		let BDnow = dateTime.addHours( new Date(), 6 )
//
// 		user.customUpdateOne( {
// 				_id: userData._id
// 			}, {
// 				"$set": {
// 					"account_activation_end": dateTime.format( dateTime.addMonths( BDnow, 1 ), "YYYY-MM-DD" ),
// 					"account_active_date": dateTime.format( BDnow, "YYYY-MM-DD" ),
// 					"max_app_install": validateResult.value.userMaxApp,
// 				},
// 				"$inc": {
// 					"total_payment": validateResult.value.ammount
// 				},
// 				"$push": {
// 					"tracking": {
// 						"payment_date": dateTime.format( BDnow, "YYYY-MM-DD HH:mm:ss" ),
// 						"ammount": validateResult.value.ammount
// 					}
// 				}
// 			} )
// 			.then( userUpdateValue => {
// 				if ( !userUpdateValue.result.nModified ) {
// 					return res.status( 200 ).json( {
// 						success: false,
// 						message: 'Server Error. Please try again later.'
// 					} )
// 				}
// 				return res.status( 200 ).json( {
// 					success: true,
// 					message: "Transaction Successful"
// 				} )
// 			} )
// 			.catch( err => next( err ) )
// 	} )
// 	.catch( err => next( err ) )
