"use strict";

const passport = require( 'passport' )
const localStrategy = require( 'passport-local' ).Strategy
const {
	user,
	admin,
	login
} = require( join( MODEL_DIR, 'auth/Model_Login' ) );

module.exports = ( app ) => {
	passport.use( 'user',
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

	passport.serializeUser( ( info, done ) => done( null, info ) )

	passport.deserializeUser( ( info, done ) => login( info ).then( data => done( null, data ) ).catch( err => done( err ) ) )

	app.use( passport.initialize() )
	app.use( passport.session() )
}
