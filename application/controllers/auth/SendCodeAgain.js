"use strict";

const dateTime = require( 'date-and-time' )
const {
	checkUser
} = require( join( MODEL_DIR, 'auth/Model_Send_Code_Again' ) )

exports.sendCodeAgain = ( req, res, next ) => {

	// TODO: here we can check email & rd parameter using joi but I think that not needed.
	if ( ( !req.body.email && !req.body.rd ) || !checkRDParam( req.body.rd, req.body.verify ) ) {
		return res.json( {
			success: false,
			message: 'Invalid request.'
		} );
	}

	checkUser( req.body.email, req.body.rd )
		.then( ( {
			info
		} ) => {
			return res.json( {
				message: info
			} )
		} )
		.catch( err => next( err ) )
}

function checkRDParam( rd, routeVerify = null ) {
	let now = dateTime.addHours( new Date(), 6 )
	return rd.slice( 15 ) > now.getTime() && rd.slice( 8, 15 ) === `${dateTime.format(now, 'DD')}${routeVerify?'abd':'ace'}${dateTime.format(now, 'MM')}`
}
