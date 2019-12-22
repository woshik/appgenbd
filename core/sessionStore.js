"use strict";

const config = require("config");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const sessionLifeTime = 24 * 60 * 60 * 1000;

const sessionStoreInstance = new MongoStore({
	url: config.get("database_connection_string"),
	collection: "sessions",
	ttl: sessionLifeTime,
	secret: config.get("secret_key"),
	mongoOptions: {
		useNewUrlParser: true,
		useUnifiedTopology: true
	}
});

exports.sessionStore = session({
	name: "sid",
	resave: false,
	saveUninitialized: false,
	secret: config.get("secret_key"),
	unset: "destroy",
	store: sessionStoreInstance,
	cookie: {
		maxAge: sessionLifeTime,
		SameSite: true,
		secure: process.env.NODE_ENV === "production" ? true : false
	}
});

exports.storageInstance = () => {
	return sessionStoreInstance;
};
