"use strict";

// global declaration
global.MODEL_DIR = join(BASE_DIR, "application/models");
global.CONTROLLER_DIR = join(BASE_DIR, "application/controllers");

// import other usefull modules
const http = require("http");
const https = require("https");
const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const csrf = require("csurf");
const config = require("config");
const { readFileSync } = require("fs");
const favicon = require("serve-favicon");

// import module from project
const { mongoClient } = require(join(BASE_DIR, "db", "database"));
const { sessionStore } = require(join(BASE_DIR, "core", "sessionStore"));
const { logger } = require(join(BASE_DIR, "core", "util"));
const auth = require(join(BASE_DIR, "core", "auth"));
const { flash } = require(join(BASE_DIR, "core", "middlewares"));

// calling express function
const app = express();

app.use((req, res, next) => {
	if (req.url === "/") {
		return res.redirect("/login/user");
	}
	next();
});

// node js process error handle
process.on("uncaughtException", err => {
	console.log(err);
	logger.error(err);
});

process.on("unhandledRejection", err => {
	console.log(err);
	logger.error(err);
});

// security configuretaion
app.use(helmet());
app.use(compression());

// app configuretaion
app.use(express.json());
app.use(
	express.urlencoded({
		extended: true
	})
);

//session configuretion
app.use(sessionStore);

// api routing
app.use("/api", require(join(BASE_DIR, "routes", "api")));

//favicon
app.use(favicon(join(BASE_DIR, "public", "images", "icons", "favicon.ico")));

// set view engine configuretaion
app.set("view engine", "ejs");
app.set("views", join(BASE_DIR, "application/views"));

app.use(express.static(join(BASE_DIR, "public")));
app.use(express.static(join(BASE_DIR, "custom")));

// csrf configuretion
app.use(csrf());

// auth configuretion
auth(app);

// set flash message
app.use(flash);

// web routing
app.use("/", require(join(BASE_DIR, "routes", "web")));

// 404 page not found
app.use((req, res) =>
	res.status(404).render("error/page", {
		status: 404,
		appName: config.get("app_name")
	})
);

// error handle
app.use((err, req, res, next) => {
	console.log(err);
	logger.error(err);
	return res.status(500).render("error/page", {
		status: 500,
		appName: config.get("app_name")
	});
});

// start mongodb and then runing the app on defined port number
mongoClient
	.then(() => {
		if (process.env.NODE_ENV === "production") {
			https
				.createServer(
					{
						key: readFileSync(join(config.get("ssl.privkey")), "utf8"),
						cert: readFileSync(join(config.get("ssl.cert")), "utf8"),
						ca: readFileSync(join(config.get("ssl.chain")), "utf8")
					},
					app
				)
				.listen(config.get("PORT"), () => console.log(`app is runing https server on port ${config.get("PORT")}`));
		} else {
			http.createServer(app).listen(config.get("PORT"), () => console.log(`app is runing http server on port ${config.get("PORT")}`));
		}
	})
	.catch(err => logger.error(err));
