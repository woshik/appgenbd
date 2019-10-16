const express = require("express");
const router = express.Router();
const { join } = require("path");
const { web } = require(join(__dirname, "..", "urlconf", "rules"));

Object.entries(web).forEach(([routeName, routeInfo]) => {
    Object.entries(routeInfo.methods).forEach(([method, httpVerb]) => {
        let middleware = routeInfo.middleware || []
        let path = routeInfo.path || ''
        router[httpVerb](routeInfo.url, middleware, require(join(__dirname, '..', 'controllers', path, routeInfo.controller))[method])
    })
})

module.exports = router;