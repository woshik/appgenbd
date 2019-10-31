const sidebar = require(join(BASE_DIR, 'urlconf', 'sideBar'))

exports.appDetailsView = (req, res, next) => {
    let appDetailsData = {
        info: commonInfo,
        title: `App Details - ${req.params.appName}`,
        userName: req.user.name,
        email: req.user.email,
        sidebar: sidebar,
        path: req.path,
        csrfToken: req.csrfToken(),
        appDetailUrl: req.path,
        appInfoNeeded: false,
    }
    let app = new model('app')
    app.findOne({ user_id: req.user._id, app_name: req.params.appName }, { randomSerial: 1, app_id: 1 })
        .then(appData => {
            appDetailsData.ussd = `${req.protocol}://${req.hostname}/api/${appData.randomSerial}/${req.params.appName}/ussd`
            appDetailsData.sms = `${req.protocol}://${req.hostname}/api/${appData.randomSerial}/${req.params.appName}/sms`

            if (!appData.app_id) {
                appDetailsData.appInfoNeeded = true
                appDetailsData.appUpdate = web.appdInfoUpdate.url.replace(':appName', req.params.appName)
            }

            res.render("user/appDetails", appDetailsData)
        })
        .catch(err => {
            next(err)
        })

}

exports.appDetails = (req, res, next) => {
    console.log(req.body)
}

exports.appUpdate = (req, res, next) => {
    const schema = Joi.object({
        appId: Joi.string().trim().label("App Id"),
        password: Joi.string().trim().label("Password"),
    })

    const validateResult = schema.validate({
        appId: req.body.appId,
        password: req.body.appPassword
    })

    if (validateResult.error) {
        return res.status(200).json({
            success: false,
            message: fromErrorMessage(validateResult.error.details[0])
        })
    }

    const app = new model("app");
    app.findOne({ app_id: validateResult.value.appId }, { _id: 1 })
        .then(appInfo => {
            console.log(appInfo)
            if (appInfo) {
                return res.status(200).json({
                    success: false,
                    message: 'This app id already exist.'
                });
            }
            app.updateOne({ user_id: req.user._id, app_name: req.params.appName }, {
                    'app_id': validateResult.value.appId,
                    'password': validateResult.value.password
                })
                .then(updateData => {
                    if (!updateData.result.nModified) {
                        return res.status(200).json({
                            success: false,
                            message: 'Your app not found.'
                        })

                    }
                    return res.status(200).json({
                        success: true,
                        message: 'Your app is successfully updated'
                    })
                })
                .catch(err => next(err))
        })
        .catch(err => next(err))
}