// import other usefull modules
const http = require('http')
const https = require('https')
const express = require('express')
const helmet = require('helmet')
const compression = require('compression')
const csrf = require('csurf')
const config = require("config")
const fs = require('fs')

// import module from project
const { mongoClient } = require(join(BASE_DIR, 'db', 'database'))
const { sessionStore, cookieStore } = require(join(BASE_DIR, 'core', 'storage'))
const { flash, logger } = require(join(BASE_DIR, 'core', 'util'))
const auth = require(join(BASE_DIR, 'core', 'auth'))
require('./autoLoader')

// calling express function
const app = express()

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
sessionStore(app)

// csrf configuretion
cookieStore(app)
app.use(csrf({ cookie: true }))

// auth configuretion
auth(app)

app.use(flash())

// web routing
app.use("/", require(join(BASE_DIR, "routes", "web")))

// 404 page not found
app.use((req, res) => {
    res.status(404).send("404 page not found")
})

// error handle
app.use((err, req, res, next) => {
    console.log(err)
    logger.error(err)
    res.status(500).send("Something fail");
})

// start mongodb and then runing the app on defined port number
mongoClient
    .then(() => {
        if (process.env.NODE_ENV === "production") {
            http.createServer(app).listen(config.get("PORT"), () => console.log(`app is runing http server on port ${config.get("PORT")}`))
            https.createServer({
                key: fs.readFileSync(join(config.get('ssl.privkey')), 'utf8'),
                cert: fs.readFileSync(join(config.get('ssl.cert')), 'utf8'),
                ca: fs.readFileSync(join(config.get('ssl.chain')), 'utf8')
            }, app).listen(config.get("PORT"), () => console.log(`app is runing https server on port ${config.get("PORT")}`))
        } else {
            http.createServer(app).listen(config.get("PORT"), () => console.log(`app is runing http server on port ${config.get("PORT")}`))
        }
    })
    .catch(err => {
        logger.error(err)
    })