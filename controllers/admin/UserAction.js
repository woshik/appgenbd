exports.payment = (req, res, next) => {
    const schema = Joi.object({
        payment: Joi.number().min(350).required().label("Payment")
    })

    const validateResult = schema.validate({
        payment: req.body.payment,
    })

    if (validateResult.error) {
        return res.status(200).json({
            success: false,
            message: fromErrorMessage(validateResult.error.details[0])
        })
    }

    let month = validateResult.value.payment / 350;

    if (!Number.isInteger(month)) {
        return res.status(200).json({
            success: false,
            message: 'Enter Payments of per month'
        })
    }

    try {
        var id = ObjectId(req.body.id)
    } catch (err) {
        next(err)
    }

    let user = new model('users')
    user.findOne({ _id: id })
        .then(userData => {
            let BDnow = dateTime.addHours(new Date(), 6)

            user.customUpdateOne({ _id: userData._id }, {
                    "$set": {
                        "account_activation_end": dateTime.format(dateTime.addMonths(BDnow, month), "YYYY-MM-DD HH:mm:ss"),
                    },
                    "$inc": {
                        "total_payment": validateResult.value.payment
                    },
                    "$push": {
                        "tracking": {
                            "payment_date": dateTime.format(BDnow, "YYYY-MM-DD HH:mm:ss"),
                            "ammount": validateResult.value.payment
                        }
                    }
                })
                .then(userUpdateValue => {
                    if (!userUpdateValue.result.nModified) {
                        return res.status(200).json({
                            message: 'Server Error. Please try again later.'
                        })
                    }
                    return res.status(200).json({
                        message: "Transaction Successful"
                    });
                })
                .catch(err => next(err))
        })
        .catch(err => next(err))
}

exports.accountStatusChange = (req, res, next) => {
    try {
        var id = ObjectId(req.body.id)
    } catch (err) {
        next(err)

        return res.status(200).json({
            message: 'Illegal user id'
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
        next(err)
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