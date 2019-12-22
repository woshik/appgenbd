// Don't Edit This File
"use strict";

const express = require("express");
const router = express.Router();
const web = require(join(BASE_DIR, "urlconf/webRule"));

Object.entries(web).forEach(([routeName, routeInfo]) => {
	Object.entries(routeInfo.methods).forEach(([method, httpVerb]) => {
		let middleware = routeInfo.middleware || [];
		let path = routeInfo.path || "";
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		///													  Route Debug														 			//
		///console.log( routeName, ( routeInfo.url, middleware, require( join( CONTROLLER_DIR, path, routeInfo.controller ) )[ method ] ) )//
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		router[httpVerb](routeInfo.url, middleware, require(join(CONTROLLER_DIR, path, routeInfo.controller))[method]);
	});
});

module.exports = router;
