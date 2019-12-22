"use strict";

const Joi = require("@hapi/joi");
const web = require(join(BASE_DIR, "urlconf", "webRule"));
const entities = new(require("html-entities").AllHtmlEntities)();
const config = require("config");
const { format } = require("date-and-time");
const { user } = require(join(BASE_DIR, "urlconf", "sideBar"));
const { companyInfo, fromErrorMessage } = require(join(BASE_DIR, "core", "util"));
const { checkAppIsActive, getAppMessageContent, getContent, updateMessageContent } = require(join(MODEL_DIR, "user/Model_App_Details"));

exports.appDetailsView = (req, res, next) => {
    checkAppIsActive(req.query.appId, req.user._id)
        .then(({ success, info }) => {
            if (success) {
                return res.render("user/base-template", {
                    layout: "app-details",
                    info: companyInfo,
                    title: `App Details - ${info.app_name}`,
                    userName: req.user.name,
                    email: req.user.email,
                    sidebar: user,
                    path: "/user/app-list",
                    csrfToken: req.csrfToken(),
                    appId: req.query.appId,
                    appDetailUrl: req.path,
                    updateContentUrl: web.updateContent.url,
                    userProfileSettingURL: web.userProfileSetting.url,
                    ussd: `${req.protocol}://${req.hostname}${process.env.NODE_ENV === "development" ? ":"+config.get("PORT") : ""}/api/${info.app_serial}/${info.app_name}/ussd`,
                    sms: `${req.protocol}://${req.hostname}${process.env.NODE_ENV === "development" ? ":"+config.get("PORT") : ""}/api/${info.app_serial}/${info.app_name}/sms`
                });
            } else {
                req.flash("appListPageMessage", "App not found.");
                return res.redirect(web.appList.url);
            }
        })
        .catch(err => next(err));
};

exports.getAppMessageContent = (req, res, next) => {
    getAppMessageContent(req.query, req.user._id)
        .then(result => {
            let response = [];
            !!result.list &&
                result.list.map(item => {
                    response.push([
                        format(new Date(item.date), "DD-MM-YYYY"),
                        item.time,
                        item.message.substring(0, 80),
                        !!item.send ? "Send" : "Panding",
                        `<a href="javascript:void(0)" title="Edit Message" class="btn btn-info" type="button" data-toggle="modal" data-target="#updateAppContentModel" onclick="updateAppMessage('${item._id}')" data-backdrop="static">
							<i class="far fa-edit"></i>
						</a>`
                    ]);
                });

            return res.json({
                data: response,
                recordsTotal: result.recordsTotal,
                recordsFiltered: result.recordsTotal
            });
        })
        .catch(err => next(err));
};

exports.getContent = (req, res, next) =>
    getContent(req.query.appContentId, req.query.appId, req.user._id)
    .then(result => res.json(result))
    .catch(err => next(err));

exports.updateContent = (req, res, next) => {
    const schema = Joi.object({
        message: Joi.string()
            .trim()
            .required()
            .label("Message")
    });

    const validateResult = schema.validate({
        message: entities.encode(req.body.updateAppContent)
    });

    if (validateResult.error) {
        return res.json({
            success: false,
            message: fromErrorMessage(validateResult.error.details[0])
        });
    }

    updateMessageContent(req.body.appContentId, req.body.appId, req.user._id, validateResult.value.message)
        .then(result => res.json(result))
        .catch(err => next(err));
};