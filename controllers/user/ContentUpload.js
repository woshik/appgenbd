const sidebar = require(join(BASE_DIR, 'urlconf', 'sideBar'))

exports.contentUploadView = (req, res, next) => {
    let app = new model("app")
    app.findOne({ user_id: req.user._id, app_name: req.params.appName, app_active: true }, { _id: 1 })
        .then(result => {
            if (!result) {
                req.flash('app-list-message', 'App not found.')
                return res.redirect(web.appList.url)
            }

            let contentUpdateData = {
                info: commonInfo,
                title: 'Content Upload',
                userName: req.user.name,
                email: req.user.email,
                sidebar: sidebar,
                current: req.path,
                path: req.path,
                csrfToken: req.csrfToken(),
                uploadContentForm: web.contentUpload.url.replace(':appName', req.params.appName),
            }
            return res.render("user/contentUpload", contentUpdateData);
        })
        .catch(err => next(err))
};

exports.contentUpload = async (req, res, next) => {
    let message = req.body.messageContent
    let dateTime = req.body.dateTime

    if (typeof message === "string") {
        message = [message]
        dateTime = [dateTime]
    }

    if (message.length === dateTime.length) {
        let length = message.length

        for (let i = 0; i < length; i++) {

            let result = new Promise((response, reject) => {
                const schema = Joi.object({
                    dateTime: Joi.string().trim().required().pattern(/^20[0-9]{2}-[0-1][0-9]-[0-3][0-9] [0-1][0-9]:00 (am|pm)$/).label("Message receiving date time"),
                    content: Joi.string().trim().required().label("Message content")
                })

                const validateResult = schema.validate({
                    dateTime: dateTime[i],
                    content: message[i]
                })

                if (validateResult.error) {
                    response({
                        success: false,
                        possition: i + 1,
                        message: fromErrorMessage(validateResult.error.details[0])
                    })
                }
            })

            result.then(data => {
                    if (!data.success) {
                        return res.json(data)
                    }
                })
                .catch(err => next(err))
        }
    } else {
        return res.json({
            success: false,
            message: "Please don't edit yourself, you will be back listed."
        })
    }






    // app = new model('app')
    // app.find({
    //         user_id: req.user._id,
    //         app_name: validateResult.value.appName,
    //         content: { $elemMatch: { date: req.body.messageDate } }
    //     }, { content: 1 })
    //     .then(contentData => {
    //         if (contentData && contentData.length === 10) {
    //             return res.status(200).json({
    //                 success: false,
    //                 message: 'Already you are submit 10 message for that date'
    //             })
    //         }

    //         app.customUpdateOne({ user_id: req.user._id, app_name: validateResult.value.appName }, {
    //                 "$push": {
    //                     "content": {
    //                         "date": req.body.messageDate,
    //                         "time": validateResult.value.messageTime,
    //                         "message": validateResult.value.content
    //                     }
    //                 }
    //             })
    //             .then(updateValue => {
    //                 if (!updateValue.result.nModified) {
    //                     return res.status(200).json({
    //                         success: false,
    //                         message: 'Server error. Plase try again later.'
    //                     })
    //                 }

    //                 return res.status(200).json({
    //                     success: true,
    //                     message: 'Data Successfully save.'
    //                 })
    //             })
    //             .catch(err => next(err))
    //     })
    //     .catch(err => next(err))
}