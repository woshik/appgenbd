const sidebar = require(join(BASE_DIR, 'urlconf', 'sideBar'))

exports.contentUploadView = (req, res, next) => {
    const app = new model("app");

    app.find({ user_id: req.user._id }, { app_name: 1 , _id: 0})
        .then(result => {
            let contentUpdateData = {
                info: commonInfo,
                title: 'Content Upload',
                userName: req.user.name,
                email: req.user.email,
                sidebar: sidebar,
                path: req.path,
                csrfToken: req.csrfToken(),
                appList: result,
                uploadContentForm: web.contentUpload.url,
            }
            res.render("user/contentUpload", contentUpdateData);
        })
        .catch(err => {
            return next(err)
        })
};

exports.contentUpload = (req, res, next) => {

    const schema = Joi.object({
        appName: Joi.string().trim().required().label("App name"),
        messageDate: Joi.date().greater(new Date(dateTime.format(dateTime.addHours(new Date, 6), "YYYY-MM-DD"))).required().label("Message receiving date"),
        messageTime: Joi.string().trim().pattern(/^[0-9:]+$/).required().label("Message receiving time"),
        content: Joi.string().trim().required().label("Message content")
    })

    const validateResult = schema.validate({
        appName: req.body.appName,
        messageDate: req.body.messageDate,
        messageTime: req.body.messageTime,
        content: req.body.messageContent
    })

    if (validateResult.error) {
        return res.status(200).json({
            success: false,
            message: fromErrorMessage(validateResult.error.details[0])
        })
    }



    app = new model('app')
    app.find({
            user_id: req.user._id,
            app_name: validateResult.value.appName,
            content: { $elemMatch: { date: req.body.messageDate } }
        }, { content: 1 })
        .then(contentData => {
            if (contentData && contentData.length === 10) {
                return res.status(200).json({
                    success: false,
                    message: 'Already you are submit 10 message for that date'
                })
            }

            app.customUpdateOne({ user_id: req.user._id, app_name: validateResult.value.appName }, {
                    "$push": {
                        "content": {
                            "date": req.body.messageDate,
                            "time": validateResult.value.messageTime,
                            "message": validateResult.value.content
                        }
                    }
                })
                .then(updateValue => {
                    if (!updateValue.result.nModified) {
                        return res.status(200).json({
                            success: false,
                            message: 'Server error. Plase try again later.'
                        })
                    }

                    return res.status(200).json({
                        success: true,
                        message: 'Data Successfully save.'
                    })
                })
                .catch(err => next(err))
        })
        .catch(err => next(err))
}