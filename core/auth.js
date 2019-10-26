const localStrategy = require('passport-local').Strategy


module.exports = (app) => {
    passport.use('users',
        new localStrategy({ usernameField: 'email' }, (email, password, done) => {
            let user = new model('users')
            user.findOne({ email: email })
                .then(userData => {
                    if (!userData) return done(null, false, { message: "Email address not register" })
                    bcrypt.compare(password, userData.password)
                        .then(isMatch => {
                            if (isMatch) {
                                if (userData.email_verify) {
                                    if (userData.account_active) {
                                        return done(null, userData)
                                    } else {
                                        return done(null, false, { message: 'Your account is deactivated. Please contact with admin.' })
                                    }
                                } else {
                                    let userRDId = crypto.randomBytes(30).toString('hex')
                                    user.updateOne({ email: email }, { "userRDId": userRDId })
                                        .then(userUpdateValue => {})
                                        .catch(err => next(err))
                                    return done(null, false, { message: 'Please active your account first, <a href=' + web.emailVerification.url.replace(":id", userRDId) + '>Click Here</a>' })
                                }
                            }
                            return done(null, false, { message: "Password doesn't match" })
                        })
                        .catch(err => done(err))
                })
                .catch(err => done(err))
        })
    )

    passport.use('admin',
        new localStrategy({ usernameField: 'email' }, (email, password, done) => {
            let admin = new model('admin')
            console.log(admin)
            admin.findOne({ email: email })
                .then(userData => {
                    if (!userData) return done(null, false, { message: "Email address not register" })
                    bcrypt.compare(password, userData.password)
                        .then(isMatch => {
                            if (isMatch) {
                                return done(null, userData)
                            }
                            return done(null, false, { message: "Password doesn't match" })
                        })
                        .catch(err => done(err))
                })
                .catch(err => done(err))
        })
    )

    passport.serializeUser((user, done) => {
        let key = { id: user._id }
        !!user.super_user ? (key.model = 'admin') : (key.model = 'users')
        return done(null, key)
    })

    passport.deserializeUser((key, done) => {
        let user = new model(key.model)
        user.findOne({ _id: ObjectId(key.id) })
            .then(userData => {
                let obj = {}
                if (key.model === 'users') {
                    obj = {
                        _id: userData._id,
                        name: userData.name,
                        number: userData.number,
                        email: userData.email,
                        account_activation_end: userData.account_activation_end,
                        max_app_install: userData.max_app_install,
                        app_install: userData.app_install,
                        active: dateTime.subtract(new Date(userData.account_activation_end), dateTime.addHours(new Date(), 6)).toDays() >= 0
                    }
                } else {
                    obj = {
                        _id: userData._id,
                        email: userData.email,
                        super_user: userData.super_user
                    }
                }
                done(null, obj)
            })
            .catch(err => done(err))
    })

    app.use(passport.initialize())
    app.use(passport.session())
}