const { join } = require("path")
const Joi = require('@hapi/joi')
const crypto = require('crypto')
const { ObjectId } = require('mongodb')
const { commonInfo, fromErrorMessage, localTime, onlyDate } = require(join(__dirname, "../../", "core", "util"))
const web = require(join(__dirname, "../../", "urlconf", "webRule"))
const sidebar = require(join(__dirname, "../../", "urlconf", "sidebar"))
const model = require(join(__dirname, "../../", "db", "model"))

const contentUploadView = (req, res, next) => {

    const app = new model("app");

    app.find({ userId: req.user._id }, { app_name: 1 })
        .then(result => {
            res.render("user/contentUpload", {
                info: commonInfo,
                title: 'Content Upload',
                userName: req.user.name,
                email: req.user.email,
                active: (localTime(onlyDate()).getTime() <= localTime(req.user.account_activation_end).getTime()),
                sidebar: sidebar,
                path: req.path,
                csrfToken: req.csrfToken(),
                appList: result,
                uploadContentForm: web.contentUpload.url,
            });
        })
        .catch(err => {
            return next(err)
        })
};

const contentUpload = (req, res, next) => {

    const schema = Joi.object({
        appId: Joi.string().trim().pattern(/^[a-zA-Z0-9]+$/).required().label("App name"),
        messageDate: Joi.date().greater(localTime(onlyDate())).required().label("Message receiving date"),
        messageTime: Joi.string().trim().pattern(/^[0-9:]+$/).required().label("Message receiving time"),
        content: Joi.string().trim().required().label("Message content")
    })

    const validateResult = schema.validate({
        appId: req.body.appId,
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

    messageContent = new model('content')
    messageContent.findOne({
            user_id: req.user._id,
            app_id: validateResult.value.appId,
            date: validateResult.value.messageDate,
        })
        .then(message => {
            if (!message) message = []

            if (message.length === 10) {
                return res.status(200).json({
                    success: false,
                    message: 'Already you are submit 10 message for that date'
                })
            }

            messageContent.save({
                    user_id: req.user._id,
                    app_id: ObjectId(validateResult.value.appId),
                    date: req.body.messageDate,
                    time: req.body.messageTime,
                    content: validateResult.value.content
                })
                .then(saveData => {
                    if (!saveData.result.ok) {
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

module.exports = {
    contentUploadView,
    contentUpload
}