"use strict";

const Joi = require( '@hapi/joi' )
const {
	ObjectId
} = require( 'mongodb' )
const {
	payment
} = require( join( MODEL_DIR, 'admin/Model_User_Action' ) )

exports.payment = ( req, res, next ) => {
	const schema = Joi.object( {
		userMaxAppCanInstall: Joi.number().required().label( "Max App" ),
		ammount: Joi.number().required().label( "Ammount" ),
	} )

	const validateResult = schema.validate( {
		userMaxAppCanInstall: req.body.userMaxAppCanInstall,
		ammount: req.body.ammount
	} )

	try {
		var id = ObjectId( req.body.id )
	} catch ( e ) {
		return res.json( {
			success: false,
			message: 'Please, don\'t violate the process.'
		} )
	}

	payment( validateResult.value, id )
		.then( ( {
			success,
			info
		} ) => res.json( {
			success: success,
			message: info
		} ) )
		.catch( err => next( err ) )
}

exports.accountStatusChange = ( req, res, next ) => {
	try {
		var id = ObjectId( req.body.id )
	} catch ( err ) {
		return res.status( 200 ).json( {
			success: false,
			message: 'Please, don\'t violate the process.'
		} )
	}
	console.log( req.body.id )

	let user = new model( 'users' )
	user.findOne( {
			_id: id
		} )
		.then( userData => {
			user.updateOne( {
					_id: userData._id
				}, {
					"account_active": !userData.account_active
				} )
				.then( userUpdateValue => {
					if ( !userUpdateValue.result.nModified ) {
						return res.status( 200 ).json( {
							success: false,
							message: 'User not found'
						} )
					}
					return res.status( 200 ).json( {
						success: true,
						message: `Successful account is ${userData.account_active ? 'deactivated' : 'activated' }`
					} )
				} )
				.catch( err => next( err ) )
		} )
		.catch( err => next( err ) )
}

exports.accountDelete = ( req, res, next ) => {
	try {
		var id = ObjectId( req.body.id )
	} catch ( err ) {
		return res.status( 200 ).json( {
			success: false,
			message: 'Please, don\'t violate the process.'
		} )
	}

	let user = new model( 'users' )
	user.updateOne( {
			_id: id
		}, {
			'account_delete': true
		} )
		.then( userUpdateValue => {
			if ( !userUpdateValue.result.nModified ) {
				return res.status( 200 ).json( {
					success: false,
					message: 'User not found'
				} )
			}
			return res.status( 200 ).json( {
				success: true,
				message: "Successful account is deleted"
			} )
		} )
		.catch( err => next( err ) )

	let content = new model( 'content' )
	content.deleteMany( {
			user_id: id
		} )
		.then( result => {} )
		.catch( err => next( err ) )

	let app = new model( 'app' )
	app.deleteMany( {
			user_id: id
		} )
		.then( result => {} )
		.catch( err => next( err ) )
}
