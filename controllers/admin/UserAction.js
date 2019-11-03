const { ObjectId } = require('mongodb')

exports.payment = (req, res, next) => {
    console.log(req.body)
    const schema = Joi.object({
        userMaxApp: Joi.number().min(req.user.setting.max_app).required().label("Max App"),
        ammount: Joi.number().min(req.user.setting.cost_per_month).required().label("Ammount"),
    })

    const validateResult = schema.validate({
        userMaxApp: req.body.userMaxApp,
        ammount: req.body.ammount
    })

    if (validateResult.error) {
        return res.status(200).json({
            success: false,
            message: fromErrorMessage(validateResult.error.details[0])
        })
    }

    if (validateResult.value.userMaxApp % req.user.setting.max_app !== 0) {
        return res.status(200).json({
            success: false,
            message: 'Please, enter correct app package.'
        })
    }

    if (((validateResult.value.userMaxApp / req.user.setting.max_app) * req.user.setting.cost_per_month) !== validateResult.value.ammount) {
        return res.status(200).json({
            success: false,
            message: 'Payment ammount isn\'t correct.'
        })
    }

    try {
        var id = ObjectId(req.body.id)
    } catch (err) {
        return res.status(200).json({
            success: false,
            message: 'Please, don\'t violate the process.'
        })
    }

    let user = new model('users')
    user.findOne({ _id: id })
        .then(userData => {
            let BDnow = dateTime.addHours(new Date(), 6)

            user.customUpdateOne({ _id: userData._id }, {
                    "$set": {
                        "account_activation_end": dateTime.format(dateTime.addMonths(BDnow, 1), "YYYY-MM-DD"),
                        "account_active_date": dateTime.format(BDnow, "YYYY-MM-DD"),
                        "max_app_install": validateResult.value.userMaxApp,
                    },
                    "$inc": {
                        "total_payment": validateResult.value.ammount
                    },
                    "$push": {
                        "tracking": {
                            "payment_date": dateTime.format(BDnow, "YYYY-MM-DD HH:mm:ss"),
                            "ammount": validateResult.value.ammount
                        }
                    }
                })
                .then(userUpdateValue => {
                    if (!userUpdateValue.result.nModified) {
                        return res.status(200).json({
                            success: false,
                            message: 'Server Error. Please try again later.'
                        })
                    }
                    return res.status(200).json({
                        success: true,
                        message: "Transaction Successful"
                    })
                })
                .catch(err => next(err))
        })
        .catch(err => next(err))
}

exports.accountStatusChange = (req, res, next) => {
    try {
        var id = ObjectId(req.body.id)
    } catch (err) {
        return res.status(200).json({
            success: false,
            message: 'Please, don\'t violate the process.'
        })
    }
    console.log(req.body.id)

    let user = new model('users')
    user.findOne({ _id: id })
        .then(userData => {
            user.updateOne({ _id: userData._id }, { "account_active": !userData.account_active })
                .then(userUpdateValue => {
                    if (!userUpdateValue.result.nModified) {
                        return res.status(200).json({
                            success: false,
                            message: 'User not found'
                        })
                    }
                    return res.status(200).json({
                        success: true,
                        message: `Successful account is ${userData.account_active ? 'deactivated' : 'activated' }`
                    })
                })
                .catch(err => next(err))
        })
        .catch(err => next(err))
}

exports.accountDelete = (req, res, next) => {
    try {
        var id = ObjectId(req.body.id)
    } catch (err) {
        return res.status(200).json({
            success: false,
            message: 'Please, don\'t violate the process.'
        })
    }

    let user = new model('users')
    user.updateOne({ _id: id }, { 'account_delete': true })
        .then(userUpdateValue => {
            if (!userUpdateValue.result.nModified) {
                return res.status(200).json({
                    success: false,
                    message: 'User not found'
                })
            }
            return res.status(200).json({
                success: true,
                message: "Successful account is deleted"
            })
        })
        .catch(err => next(err))

    let content = new model('content')
    content.deleteMany({ user_id: id })
        .then(result => {})
        .catch(err => next(err))

    let app = new model('app')
    app.deleteMany({ user_id: id })
        .then(result => {})
        .catch(err => next(err))
}