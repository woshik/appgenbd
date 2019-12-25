"use strict";

exports.isUserAuthenticated = (req, res, next) => {
	if (req.isAuthenticated() && req.user.role === "user") {
		return next();
	} else {
		return res.redirect("/login/user");
	}
};

exports.userCanAccessAfterLogin = (req, res, next) => {
	if (req.isAuthenticated()) {
		return res.redirect(`/${req.user.role}/dashboard`);
	} else {
		return next();
	}
};

exports.userAccountLimitIsAvailable = (req, res, next) => {
	if (req.user.account_limit_available) {
		return next();
	} else {
		return req.xhr ? res.json({ success: false, message: "Your account activation time is over, Please pay your bill." }) : res.redirect("/user/dashboard");
	}
};

exports.trialUserCanAccess = (req, res, next) => {
	if (req.user.trial) {
		return req.xhr ? res.json({ success: false, message: "Your are now using trial version. Please active your account." }) : res.redirect("/user/dashboard");
	} else {
		return next();
	}
};

exports.isAdminAuthenticated = (req, res, next) => {
	if (req.isAuthenticated() && req.user.role === "admin") {
		return next();
	} else {
		return res.redirect("/login/admin");
	}
};

exports.flash = (req, res, next) => {
	if (req.flash) return next();

	if (req.session === undefined) throw Error("req.flash() requires sessions");

	req.flash = (type, msg) => {
		if (type && msg) {
			let temp = {};
			temp[type] = msg;
			req.session.flash = temp;
			temp = null;
		} else if (type) {
			msg = req.session.flash && !!req.session.flash[type] ? req.session.flash[type] : false;
			req.session.flash = null;
			return msg;
		} else {
			return false;
		}
	};

	next();
};
