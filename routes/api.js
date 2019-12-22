// Don't Edit This File
"use strict";

const express = require("express");
const router = express.Router();
const api = require(join(BASE_DIR, "urlconf/apiRule"));

Object.entries(api).forEach(([routeName, routeInfo]) => {
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
