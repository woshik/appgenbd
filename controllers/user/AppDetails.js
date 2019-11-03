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
    const app = new model("app")
    let order = ['app_name', 'app_id', 'subscribe', 'dial']
    let sort = {}

    if (req.body.order) {
        sort[order[parseInt(req.body.order[0].column)]] = req.body.order[0].dir === 'asc' ? 1 : -1
    } else {
        sort[order[0]] = 1
    }

    app.dataTable({
            user_id: req.user._id,
            '$or': [
                { app_name: RegExp(`.*${req.body.search.value}.*`, 'i') },
                { app_id: RegExp(`.*${req.body.search.value}.*`, 'i') }
            ]
        }, {
            _id: 0,
            user_id: 0,
            password: 0,
            randomSerial: 0,
        }, parseInt(req.body.start), parseInt(req.body.length), sort)
        .then(result => {
            let response = []
            result.data.map((item, index) => {
                response.push([
                    item.app_name,
                    item.app_id,
                    item.subscribe,
                    item.dial,
                    dateTime.format(item.create_date, "DD-MM-YYYY hh:mm:ss A"),
                    `<a href="${web.appdetails.url.replace(':appName', item.app_name)}" class="btn btn-success">App Details</a>`
                ])
            })

            return res.json({
                data: response,
                recordsTotal: result.recordsTotal,
                recordsFiltered: result.recordsFiltered,
                draw: parseInt(req.query.draw),
            })
        })
        .catch(err => next(err))
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