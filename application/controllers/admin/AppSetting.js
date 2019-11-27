const { ObjectId } = require('mongodb')

exports.appSetting = (req, res, next) => {
    const schema = Joi.object({
        maxAppInstall: Joi.number().min(15).required().label("Max app"),
        costPerMonth: Joi.number().min(350).required().label("Cost per month")
    })

    const validateResult = schema.validate({
        maxAppInstall: req.body.maxAppInstall,
        costPerMonth: req.body.costPerMonth,
    })

    if (validateResult.error) {
        return res.status(200).json({
            success: false,
            message: fromErrorMessage(validateResult.error.details[0])
        })
    }

    let setting = new model('setting')

    if (req.body.id) {

        try {
            var id = ObjectId(req.body.id)
        } catch {
            return res.status(200).json({
                success: false,
                message: 'Please, don\'t violate the process.'
            })
        }

        setting.updateOne({ _id: id }, {
                "max_app": validateResult.value.maxAppInstall,
                "cost_per_month": validateResult.value.costPerMonth
            })
            .then(response => {
                if (!response.result.nModified) {
                    return res.status(200).json({
                        success: false,
                        message: 'Server Error. Please try again later.'
                    })
                }

                return res.status(200).json({
                    success: true,
                    message: 'Successfully app setting updated'
                })
            })
            .catch(err => next(err))

    } else {
        setting.save({
                max_app: validateResult.value.maxAppInstall,
                cost_per_month: validateResult.value.costPerMonth
            })
            .then(response => {
                return res.status(200).json({
                    success: true,
                    message: 'Successfully app setting updated'
                })
            })
            .catch(err => next(err))
    }
}