"use strict";

const Joi = require( '@hapi/joi' )
const dateTime = require( 'date-and-time' )
const {
	checkUser
} = require( join( MODEL_DIR, 'auth/Model_Send_Code_Again' ) )

exports.sendCodeAgain = ( req, res, next ) => {

	const schema = Joi.object( {
		email: Joi.string().trim().email().required(),
		rd: Joi.string().trim().hex().required(),
	} );

	const validateResult = schema.validate( {
		email: req.body.email,
		rd: req.body.rd
	} );

	if ( validateResult.error ) {
		return res.json( {
			success: false,
			message: 'Invalid request.'
		} )
	} else if ( !checkRDParam( validateResult.value.rd ) ) {
		return res.json( {
			success: false,
			message: 'Invalid request.'
		} )
	}

	checkUser( validateResult.value )
		.then( ( {
			info
		} ) => {
			return res.json( {
				message: info
			} )
		} )
		.catch( err => next( err ) )
}

function checkRDParam( rd ) {
	let now = dateTime.addHours( new Date(), 6 )
	return rd.slice( 15 ) > now.getTime() && rd.slice( 8, 15 ) === `${dateTime.format(now, 'DD')}ace${dateTime.format(now, 'MM')}`
}
