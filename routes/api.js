// Do Edit This File

const express = require( "express" )
const router = express.Router()

Object.entries( api ).forEach( ( [ routeName, routeInfo ] ) => {
	Object.entries( routeInfo.methods ).forEach( ( [ method, httpVerb ] ) => {
		let middleware = routeInfo.middleware || []
		let path = routeInfo.path || ''
		router[ httpVerb ]( routeInfo.url, middleware, require( join( CONTROLLER_DIR, path, routeInfo.controller ) )[ method ] )
	} )
} )

module.exports = router
