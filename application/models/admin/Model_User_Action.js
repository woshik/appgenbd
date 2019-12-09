"use strict";

const dateTime = require( 'date-and-time' )
const {
	getDB
} = require( join( BASE_DIR, 'db', 'database' ) )

exports.payment = ( paymentInfo, id ) => {
	return new Promise( ( resolve, reject ) => {
		getDB().createCollection( 'users' )
			.then( async userCollection => {
				try {
					let settingData = await getDB().collection( 'setting' ).findOne( {} )
					console.log( settingData )
					if ( paymentInfo.userMaxAppCanInstall % settingData.max_app_can_install !== 0 ) {
						return resolve( {
							success: false,
							info: 'Please, enter correct app package.'
						} )
					} else if ( ( ( paymentInfo.userMaxAppCanInstall / settingData.max_app_can_install ) * settingData.cost_par_month ) !== paymentInfo.ammount ) {
						return resolve( {
							success: false,
							info: 'Payment ammount isn\'t correct.'
						} )
					}
					let BDnow = dateTime.addHours( new Date(), 6 )
					await userCollection.updateOne( {
						_id: id
					}, {
						$set: {
							account_activation_end_date: dateTime.format( dateTime.addMonths( BDnow, 1 ), "YYYY-MM-DD" ),
							account_activation_start_date: dateTime.format( BDnow, "YYYY-MM-DD" ),
							max_app_can_install: paymentInfo.userMaxAppCanInstall,
						},
						$inc: {
							total_payment: paymentInfo.ammount
						},
						$push: {
							tracking: {
								payment_date: dateTime.format( BDnow, "YYYY-MM-DD HH:mm:ss" ),
								ammount: paymentInfo.ammount
							}
						},
						$unset: {
							trial: 1,
						}
					} )

					return resolve( {
						success: true,
						info: "Transaction Successful"
					} )

				} catch ( err ) {
					return reject( err )
				}
			} )
			.catch( err => reject( err ) )
	} )
}
