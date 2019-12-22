"use strict";

const Joi = require("@hapi/joi");
const { format } = require("date-and-time");
const web = require(join(BASE_DIR, "urlconf", "webRule"));
const { user } = require(join(BASE_DIR, "urlconf", "sideBar"));
const { companyInfo, fromErrorMessage } = require(join(BASE_DIR, "core", "util"));
const { getAppList, updateAppInfo, updateAppStatus, deleteApp } = require(join(MODEL_DIR, "user/Model_App_List"));

exports.appListView = (req, res) => {
	res.render("user/base-template", {
		layout: "app-list",
		info: companyInfo,
		title: "App List",
		path: req.path,
		sidebar: user,
		csrfToken: req.csrfToken(),
		userName: req.user.name,
		email: req.user.email,
		flashMessage: req.flash("appListPageMessage"),
		appInfoUpdateUrl: web.appdInfoUpdate.url,
		appStatusChangeUrl: web.appStatusChange.url,
		deleteAppUrl: web.deleteApp.url,
		userProfileSettingURL: web.userProfileSetting.url
	});
};

exports.appList = (req, res, next) => {
	getAppList(req.query, req.user._id)
		.then(appList => {
			let response = [];
			appList.list.map(appData => {
				let actionBtn =
					!!appData.provider_id && !!appData.provider_password
						? appData.app_active
							? `
							<a href="${web.appdetails.url}?appId=${appData._id}" title="Details" class="btn btn-primary btn-icon" >
								<i class="fas fa-eye"></i>
							</a>
							<a href="${web.contentUpload.url}?appId=${appData._id}" title="Message upload" class="btn btn-primary btn-icon">
								<i class="fas fa-cloud-upload-alt"></i>
							</a>
							<a href="javascript:void(0)" class="btn btn-warning btn-icon" type="button" data-toggle="modal" data-target="#appStatusChangeModal" title="Deactivate Your App" onclick="appStatusChange('${appData._id}')" data-backdrop="static">
								<i class="fas fa-toggle-off"></i>
							</a>
							`
							: `
							<a href="javascript:void(0)" class="btn btn-success btn-icon" type="button" data-toggle="modal" data-target="#appStatusChangeModal" title="Activate Your App" onclick="appStatusChange('${appData._id}')" data-backdrop="static">
								<i class="fas fa-toggle-on"></i>
							</a>
							`
						: `
						<a href="javascript:void(0)" title="Update App Information" class="btn btn-primary btn-icon" type="button" data-toggle="modal" data-target="#updateAppInfoModal" onclick="appInfoUpdate('${appData._id}')" data-backdrop="static">
							<i class="fas fa-file-invoice"></i>
						</a>
						`;

				actionBtn += `
					<a href="javascript:void(0)" title="Delete Your App" class="btn btn-danger btn-icon" type="button" data-toggle="modal" data-target="#deleteAppModal" onclick="deleteApp('${appData._id}')" data-backdrop="static">
						<i class="fas fa-trash-alt"></i>
					</a>
				`;

				response.push([
					appData.app_name,
					appData.provider_id,
					appData.subscribers || 0,
					appData.dial || 0,
					format(appData.create_date_time, "DD-MM-YYYY hh:mm:ss A"),
					appData.app_active ? '<i class="far fa-check-circle correct"></i>' : '<i class="far fa-times-circle wrong"></i>',
					actionBtn
				]);
			});

			return res.json({
				data: response,
				recordsTotal: appList.recordsTotal,
				recordsFiltered: appList.recordsFiltered
			});
		})
		.catch(err => next(err));
};

exports.appUpdate = (req, res, next) => {
	const schema = Joi.object({
		providerId: Joi.string()
			.trim()
			.pattern(/^[a-zA-Z0-9_-\s]+$/)
			.required()
			.uppercase()
			.label("App Id"),
		providerPassword: Joi.string()
			.trim()
			.required()
			.label("Password")
	});

	const validateResult = schema.validate({
		providerId: req.body.providerId,
		providerPassword: req.body.providerPassword
	});

	if (validateResult.error) {
		return res.json({
			success: false,
			message: fromErrorMessage(validateResult.error.details[0])
		});
	}

	updateAppInfo(validateResult.value, req.body.appId, req.user._id)
		.then(result => res.json(result))
		.catch(err => next(err));
};

exports.appStatusChange = (req, res, next) =>
	updateAppStatus(req.body.appId, req.user._id)
		.then(result => res.json(result))
		.catch(err => next(err));

exports.deleteApp = (req, res, next) =>
	deleteApp(req.body.appId, req.user._id)
		.then(result => res.json(result))
		.catch(err => next(err));
