const config = require("config")
const session = require("express-session")
const MongoStore = require("connect-mongo")(session)
const cookieParser = require("cookie-parser")

exports.sessionStore = (app, opt) => {
    let options = opt || {}
    app.use(session({
        secret: (options.encryption === undefined || options.encryption === true) ? config.get("session_secret") : '',
        resave: options.resave || false,
        saveUninitialized: options.saveUninitialized || false,
        store: new MongoStore({
            url: config.get("database_connection_string"),
            collection: options.collectionName || "sessions",
            ttl: (24 * 60 * 60 ),
            secret: (options.encryption === undefined || options.encryption === true) ? config.get("session_secret") : '',
            mongoOptions: {
                useNewUrlParser: true, 
                useUnifiedTopology: true
            }
        }),
        cookie: {
            domain: config.get("domain_name"),
            maxAge: (24 * 60 * 60 * 1000),
            httpOnly: options.httpOnly || true,
            secure: process.env.NODE_ENV === "production" ? true : false
        }
    }))
}

exports.cookieStore = (app, opt) => {
    let options = opt || {}
    app.use(cookieParser(config.get("cookie_secret"), {
        domain: config.get("domain_name"),
        maxAge:  (24 * 60 * 60),
        httpOnly: options.httpOnly || true,
        secure: process.env.NODE_ENV === "production" ? true : false
    }))
}