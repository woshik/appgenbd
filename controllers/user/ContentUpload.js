const path = require("path");
const Joi = require('@hapi/joi');
const randomstring = require("randomstring");
const ObjectId = require("mongodb").ObjectID;

const UTIL_FOLDER = path.join(__dirname, "../../../", "util");

const { web } = require(path.join(UTIL_FOLDER, "urls"));
const commonInfo = require(path.join(UTIL_FOLDER, "commonInfo.js"));
const { FromError } = require(path.join(UTIL_FOLDER, "errorMessage"));
const sidebar = require(path.join(UTIL_FOLDER, "sideBar"));

const model = require(path.join(__dirname, "../../", "models", "model"));

const contentUploadView = (req, res, next) => {

    const app = new model("app");

    app.find({ userId: req.user._id }, { app_name: 1 })
        .then(result => {
            res.render("user/contentUpload", {
                info: commonInfo,
                title: 'Content Upload',
                userName: req.user.name,
                email: req.user.email,
                active: req.user.account_active,
                sidebar: sidebar,
                path: req.path,
                csrfToken: req.csrfToken(),
                appList: result,
                uploadContentForm: web.contentUpload,
            });
        })
        .catch(err => {
            return next(err)
        })
};

const contentUpload = (req, res, next) => {
    const schema = Joi.object({
        appId: Joi.string().trim().pattern(/^[a-zA-Z0-9]+$/).required().label("App Name"),
        messageDate: Joi.string().trim().pattern(/^[0-9-]+$/).required().label("Message Receiving Date"),
        content: Joi.string().trim().required().label("Message")
    })

    const validateResult = schema.validate({
        appId: req.body.appId,
        messageDate: req.body.messageDate,
        content: req.body.messageContent
    })

    if (validateResult.error) {
        return res.status(200).json({
            success: false,
            message: FromError(validateResult.error.details[0])
        });
    }

    messageContent = new model('message-content')

    messageContent.findOne({
        user_id: req.user._id, 
        app_id: validateResult.value.appId,
        date: validateResult.value.messageDate,
        message: validateResult.value.content
    })
        .then(result => {
            let nd = new Date(validateResult.value.messageDate)
            nd.setHours(nd.getHours()+6)
            nd.setDate(nd.setDate()+1)

            return req.status(200).json({success: true, date: nd})
        })
        .catch(err => {
            return next(err)
        }) 
};

const sendMessageDate = (req, res, next) => {
    const schema = Joi.object({
        appId: Joi.string().trim().pattern(/^[a-zA-Z0-9]+$/).required().label("App Name"),
    });

    const validateResult = schema.validate({
        appId: req.query.appId,
    });

    if (validateResult.error) {
        return res.status(200).json({
            success: false,
            message: FromError(validateResult.error.details[0])
        });
    }

    try {
        var appId = ObjectId(validateResult.value.appId);
    } catch (err) {
        return next(err);
    }

    messageContent = new model('message-content')

    messageContent.findOne({ app_id: appId, user_id: req.user._id }, { message: 1, _id: 0 })
        .then(result => {
            if (result === null) {
                let d = new Date()
                d.setHours(d.getHours() + 6)

                return res.json({ success: true, date: d })
            }
        })
        .catch(err => {
            return next(err)
        })
}

module.exports = {
    contentUploadView,
    contentUpload,
    sendMessageDate
}