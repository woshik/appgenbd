// import other usefull modules
const http = require("http")
const express = require("express")
const helmet = require("helmet")
const compression = require("compression")
const csrf = require("csurf")

// import module from project

const { mongoClient } = require(join(BASE_DIR, "db", "database"))
const { sessionStore, cookieStore } = require(join(BASE_DIR, "core", "storage"))
const { flash } = require(join(BASE_DIR, "core", "util"))
const auth = require(join(BASE_DIR, "core", "auth"))

// define port number
const {
    PORT = 3000
} = process.env

// calling express function
const app = express()

// security configuretaion
app.use(helmet())
app.use(compression())

// set view engine configuretaion
app.set("view engine", "ejs")
app.set("views", join(__dirname, "..", "views"))

// app configuretaion
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(join(__dirname, "..", "public")))
app.use(express.static(join(__dirname, "..", "custom")))

// api routing
//app.use("/api", require(join(__dirname, "routes", "api")))

//session configuretion
sessionStore(app)

// csrf configuretion
cookieStore(app)
app.use(csrf({ cookie: true }))

// auth configuretion
auth(app)

app.use(flash())

// web routing
app.use("/", require(join(__dirname, "..", "routes", "web")))

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

process.on('uncaughtException', function(err) {
    logger.error(err)
})

// start mongodb and then runing the app on defined port number
mongoClient
    .then(() => {
        http.createServer(app).listen(PORT, () => console.log(`app is runing on port ${PORT}`))
    })
    .catch(err => {
        logger.error(err)
    })