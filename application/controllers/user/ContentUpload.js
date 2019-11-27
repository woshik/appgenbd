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
    let messageDateTime = req.body.dateTime
    let position = req.body.position

    if (typeof message === "undefined" || typeof messageDateTime === "undefined" || typeof position === "undefined") {
        return res.json({
            success: false,
            message: "Please don't edit anything yourself, you will be back listed."
        })
    }

    if (typeof position === "string") {
        message = [message]
        messageDateTime = [messageDateTime]
        position = [position]
    }

    if ((message.length === messageDateTime.length) && (messageDateTime.length === position.length)) {
        let length = message.length
        
        var clientResponse = []

        for (let i = 0; i < length; i++) {

            let result = new Promise((response, reject) => {
                const schema = Joi.object({
                    messageDateTime: Joi.string().trim().required().pattern(/^20[0-9]{2}-[0-1][0-9]-[0-3][0-9] [0-1][0-9]:00 (am|pm)$/).label("Message receiving date time"),
                    content: Joi.string().trim().required().label("Message content")
                })

                const validateResult = schema.validate({
                    messageDateTime: messageDateTime[i],
                    content: message[i]
                })

                if (validateResult.error) {
                    return response({
                        success: false,
                        position: parseInt(position[i]),
                        message: fromErrorMessage(validateResult.error.details[0])
                    })
                }

                if (dateTime.subtract(new Date(messageDateTime[i]), dateTime.addHours(new Date(), 6)).toDays() <= 0) {
                    return response({
                        success: false,
                        position: parseInt(position[i]),
                        message: 'You have to select a date which is grater than today.'
                    })
                }

                let splitDateTime = messageDateTime[i].split(" ")
                let app = new model('app')
                
                app.aggregate({
                        user_id: req.user._id,
                        app_name: req.params.appName,
                    }, {
                        _id: 0,
                        content: {
                            $filter: {
                                input: "$content",
                                as: "content",
                                cond: { $eq: ["$$content.date", splitDateTime[0]] }
                            }
                        },
                    })
                    .then(content => {
                        content = content[0].content
                        if (content && content.length === 12) {
                            return response({
                                success: false,
                                position: parseInt(position[i]),
                                message: `Already you uploaded 12 message for ${splitDateTime[0]}`
                            })
                        }

                        if (content && content.some(item => `${splitDateTime[1]} ${splitDateTime[2]}` === item.time)) {
                            return response({
                                success: false,
                                position: parseInt(position[i]),
                                message: `Already you uploaded a content on ${splitDateTime[0]} at ${splitDateTime[1]} ${splitDateTime[2]}`
                            })
                        }

                        app.customUpdateOne({ user_id: req.user._id, app_name: req.params.appName }, {
                                $push: {
                                    content: {
                                        $each: [{ date: splitDateTime[0], time: `${splitDateTime[1]} ${splitDateTime[2]}`, message: message[i] }],
                                        $sort: { date: 1, time:1 }
                                    }
                                }
                            })
                            .then(updateValue => {
                                if (!updateValue.result.nModified) {
                                    return response({
                                        success: false,
                                        position: parseInt(position[i]),
                                        message: 'Server error. Plase try again later.'
                                    })
                                }

                                response({
                                    success: true,
                                    position: parseInt(position[i]),
                                })
                            })
                            .catch(err => next(err))
                    })
                    .catch(err => next(err))
            })

            await result.then(data => {
                    clientResponse.push(data)
                })
                .catch(err => next(err))
        }

        return res.json(clientResponse)
    } else {
        return res.json({
            success: false,
            message: "Please don't edit anything yourself, you will be back listed."
        })
    }
}