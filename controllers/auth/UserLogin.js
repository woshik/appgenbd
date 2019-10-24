exports.userLoginView = (req, res) => {
    res.render("auth/userLogin", {
        info: commonInfo,
        title: "User Login",
        csrfToken: req.csrfToken(),
        loginForm: web.userLogin.url,
        forgotPassword: web.forgotPassword.url,
        registrationPage: web.registration.url,
        successMessage: req.flash('userLoginScreenSuccessMessage'),
        errorMessage: req.flash('userLoginScreenErrorMessage')
    })
}

exports.userLogin = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().trim().email().required().label("Email address"),
        password: Joi.string().trim().min(5).max(50).label("Password")
    })

    const validateResult = schema.validate({
        email: req.body.email,
        password: req.body.password
    })

    if (validateResult.error) {
        return res.status(200).json({
            success: false,
            message: fromErrorMessage(validateResult.error.details[0])
        })
    }

    passport.authenticate('users', function(err, user, info) {
        if (err) return next(err)
        if (!user) {
            return res.status(200).json({
                success: false,
                message: info.message
            })
        }

        req.login(user, (err) => {
            if (!!err) next(err)
            return res.status(200).json({
                success: true,
                message: web.userDashboard.url
            })
        })
    })(req, res, next)
}