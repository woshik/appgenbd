const sidebar = require(join(BASE_DIR, 'urlconf', 'sideBar'))
const { hashPassword } = require(join(BASE_DIR, 'core', 'util'))
const bcrypt = require('bcryptjs')

exports.dashboardView = (req, res, next) => {
    let user = new model('users')

    user.findOne({ _id: req.user._id })
        .then(userData => {
            let dashboardData = {
                info: commonInfo,
                title: 'Dashboard',
                userName: req.user.name,
                email: req.user.email,
                active: req.user.active,
                sidebar: sidebar,
                csrfToken: req.csrfToken(),
                path: req.path,
                active: dateTime.format(new Date(userData.account_active_date), 'DD-MM-YYYY'),
                expire: dateTime.format(new Date(userData.account_activation_end), 'DD-MM-YYYY'),
                maxApp: userData.max_app_install,
                appInstalled: userData.app_install,
                totalSubscriber: userData.total_subscribe,
            }

            res.render("user/dashboard", dashboardData)
        })
        .catch(err => next(err))
}

exports.userLogout = (req, res) => {
    req.flash('userLoginScreenSuccessMessage', 'Successfully Logout')
    req.logout()
    res.redirect(web.userLogin.url)
}

exports.userProfileSetting = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().trim().required().label("Name"),
        current_password: Joi.string().trim().min(5).max(50).required().label("Current Password"),
        password: Joi.string().trim().min(5).max(50).required().label("Password"),
        confirm_password: Joi.ref("password")
    })

    const validateResult = schema.validate({
        name: req.body.name,
        current_password: req.body.current_password,
        password: req.body.password,
        confirm_password: req.body.confirm_password
    })

    if (validateResult.error) {
        return res.status(200).json({
            success: false,
            message: fromErrorMessage(validateResult.error.details[0])
        })
    }

    let user = new model('users')
    user.findOne({ _id: req.user._id })
        .then(userData => {
            if (!userData) {
                return res.status(200).json({
                    success: false,
                    message: 'User not found.'
                })
            }

            bcrypt.compare(validateResult.value.current_password, userData.password)
                .then(isMatch => {
                    if (isMatch) {
                        hashPassword(validateResult.value.password)
                            .then(passwordHashed => {
                                let userInfo = {
                                    'name': validateResult.value.name,
                                    'password': passwordHashed,
                                }

                                user.updateOne({ _id: req.user._id }, userInfo)
                                    .then(userUpdateValue => {
                                        if (!userUpdateValue.result.nModified) {
                                            return res.status(200).json({
                                                success: false,
                                                message: 'Server Error. Please try again later.'
                                            })
                                        }

                                        return res.status(200).json({
                                            success: true,
                                            message: 'Successfully infomations updated.'
                                        })
                                    })
                                    .catch(err => next(err))
                            })
                            .catch(err => next(err))
                    } else {
                        return res.status(200).json({
                            success: false,
                            message: 'Current password is wrong.'
                        })
                    }
                })
                .catch(err => next(err))
        })
        .catch(err => next(err))
}