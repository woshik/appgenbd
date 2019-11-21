"use strict";

// import other usefull modules
const http = require('http')
const https = require('https')
const express = require('express')
const helmet = require('helmet')
const compression = require('compression')
const csrf = require('csurf')
const config = require("config")
const { readFileSync } = require('fs')
const favicon = require('serve-favicon')

// import module from project
const { mongoClient } = require(join(BASE_DIR, 'db', 'database'))
const sessionStore = require(join(BASE_DIR, 'core', 'storage'))
const { logger } = require(join(BASE_DIR, 'core', 'util'))
const auth = require(join(BASE_DIR, 'core', 'auth'))
const {flash, unsetFlashMessage} = require(BASE_DIR, 'core', 'middlewares')
require('./autoLoader')

// calling express function
const app = express()

//favicon
app.use(favicon(join(BASE_DIR, 'public', 'images', 'icons', 'favicon2.ico')))

// node js process error handle
process.on('uncaughtException', (err) => {
    console.log(err)
    logger.error(err)
})

process.on('unhandledRejection', (err) => {
    console.log(err)
    logger.error(err)
})

// security configuretaion
app.use(helmet())
app.use(compression())

// set view engine configuretaion
app.set('view engine', 'ejs')
app.set('views', join(BASE_DIR, 'views'))

// app configuretaion
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(join(BASE_DIR, 'public')))
app.use(express.static(join(BASE_DIR, 'custom')))

// api routing
app.use("/api", require(join(BASE_DIR, "routes", "api")))

//session configuretion
app.use(sessionStore)

// csrf configuretion
app.use(csrf({ cookie: true }))

// auth configuretion
auth(app)

// set flash message
app.use(flash)

// web routing
app.use("/", require(join(BASE_DIR, "routes", "web")))

app.use(unsetFlashMessage)

// 404 page not found
app.use((req, res) => res.render("error/page", { status: 404, appName: config.get("app_name")}))

// error handle
app.use((err, req, res, next) => {
    console.log(err)
    logger.error(err)
    return res.render("error/page", { status: 505, appName: config.get("app_name")});
})



// start mongodb and then runing the app on defined port number
mongoClient
    .then(() => {
        if (process.env.NODE_ENV === "production") {
            https.createServer({
                key: readFileSync(join(config.get('ssl.privkey')), 'utf8'),
                cert: readFileSync(join(config.get('ssl.cert')), 'utf8'),
                ca: readFileSync(join(config.get('ssl.chain')), 'utf8')
            }, app).listen(config.get("PORT"), () => console.log(`app is runing https server on port ${config.get("PORT")}`))
        } else {
            http.createServer(app).listen(config.get("PORT"), () => console.log(`app is runing http server on port ${config.get("PORT")}`))
        }
    })
    .catch(err => {
        logger.error(err)
    })