const localStrategy = require('passport-local').Strategy
const passport = require('passport')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { ObjectId } = require('mongodb')
const { join } = require('path')
const web = require(join(__dirname, '..', 'urlconf', 'webRule'))

const model = require(join(__dirname, '..', 'db', 'model'))

module.exports = (app) => {
    passport.use(
        new localStrategy({ usernameField: 'email' }, (email, password, done) => {
            let user = new model('users');
            user.findOne({ email: email })
                .then(userData => {
                    if (!userData) return done(null, false, { message: "Email address not register" })
                    bcrypt.compare(password, userData.password)
                        .then(isMatch => {
                            if (isMatch) {
                                if (userData.email_active === 1) {
                                    return done(null, userData)
                                } else {
                                    let userRDId = crypto.randomBytes(15).toString('hex')
                                    user.updateOne({ email: email }, { "userRDId": userRDId })
                                        .then(userUpdateValue => {})
                                        .catch(err => next(err))
                                    return done(null, false, { message: 'Please active your account first, <a href=' + web.emailVerification.url.replace(":id", userRDId) + '>Click Here</a>' })
                                }
                            }
                            return done(null, false, { message: "Password doesn't match" })
                        })
                        .catch(err => {
                            return done(err)
                        })
                })
                .catch(err => {
                    return done(err)
                })
        })
    )

    passport.serializeUser((user, done) => {
        return done(null, user._id)
    })

    passport.deserializeUser((id, done) => {
        let user = new model('users')
        user.findOne({ _id: ObjectId(id) })
            .then(userData => {
                return done(null, userData)
            })
            .catch(err => {
                done(err)
            })
    })

    app.use(passport.initialize());
    app.use(passport.session());
}