"use strict";

const passport = require( 'passport' )
const localStrategy = require( 'passport-local' ).Strategy
const {
	user,
	admin
} = require( join( MODEL_DIR, 'auth/Model_Login' ) );
const {
	ObjectId
} = require( 'mongodb' )

module.exports = ( app ) => {
	passport.use( 'users',
		new localStrategy( {
			usernameField: 'email'
		}, ( email, password, done ) => {
			user( email, password )
				.then( ( {
					success,
					info
				} ) => {
					if ( success ) {
						return done( null, info )
					} else {
						return done( null, false, {
							message: info
						} )
					}
				} )
				.catch( err => done( err ) )
		} )
	)

	passport.use( 'admin',
		new localStrategy( {
			usernameField: 'email'
		}, ( email, password, done ) => {
			admin( email, password )
				.then( ( {
					success,
					info
				} ) => {
					if ( success ) {
						return done( null, info )
					} else {
						return done( null, false, {
							message: info
						} )
					}
				} )
				.catch( err => done( err ) )
		} )
	)

	passport.serializeUser( ( id, done ) => {
		let key = {
			id: id
		}

		if ( !!user.super_user ) {
			key.model = 'admin'
		} else {
			key.model = 'users'
		}

		return done( null, key )
	} )

	passport.deserializeUser( ( key, done ) => {
		let user = new model( key.model )
		user.findOne( {
				_id: ObjectId( key.id )
			}, {
				_id: 1,
				name: 1,
				number: 1,
				email: 1,
				account_activation_end: 1,
				max_app_install: 1,
				app_install: 1,
				super_user: 1
			} )
			.then( async userData => {
				if ( !userData ) {
					return done( null, false )
				}

				if ( key.model === 'users' ) {
					userData.active = dateTime.subtract( new Date( userData.account_activation_end ), dateTime.addHours( new Date(), 6 ) ).toDays() >= 0
				} else {
					let setting = new model( 'setting' )
					await setting.find( {} )
						.then( data => {
							( data && data.length === 1 ) ? ( userData.setting = data[ 0 ] ) : ( userData.setting = null )
						} )
						.catch( err => next( err ) )
				}
				done( null, userData )
			} )
			.catch( err => done( err ) )
	} )

	app.use( passport.initialize() )
	app.use( passport.session() )
}
