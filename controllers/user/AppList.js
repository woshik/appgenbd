const path = require("path");

const UTIL_FOLDER = path.join(__dirname, "../../../", "util");

const { web } = require(path.join(UTIL_FOLDER, "urls"));
const commonInfo = require(path.join(UTIL_FOLDER, "commonInfo.js"));
const sidebar = require(path.join(UTIL_FOLDER, "sideBar"));

const model = require(path.join(__dirname, "../../", "models", "model"));

const appListView = (req, res, next) => {
	res.render("user/appList", {
	    info: commonInfo,
	    title: 'App List',
	    userName: req.user.name,
	    email: req.user.email,
	    active: req.user.account_active,
	    sidebar: sidebar,
	    path: req.path,
	    csrfToken: req.csrfToken(),
	    installAppForm: web.appName,
	});
};

const userAppList = (req, res, next) => {
	const app = new model("app");
	
	app.dataTable({ userId: req.user._id, app_name:RegExp(`.*${req.query.search.value}.*`, 'i')}, {_id: 0, userId: 0, randomSerial: 0, password: 0}, parseInt(req.query.start), parseInt(req.query.length))
	.then (result => {
		let response = []
		result.data.map((item, index) => {
			let itter = []
			itter.push(item.app_name)
			itter.push(item.appId)
			itter.push(item.subscribe)
			itter.push(item.dial)
			
			response.push(itter)
		})

		return res.json({
			data: response,
			recordsTotal: result.recordsTotal,
			recordsFiltered: result.recordsFiltered,
			draw: parseInt(req.query.draw),
		})
	})
	.catch(err => {
		console.log(err);
	})
}



module.exports = {
	appListView,
	userAppList
}