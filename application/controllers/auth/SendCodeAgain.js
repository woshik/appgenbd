"use strict";

const dateTime = require("date-and-time");
const { checkUser } = require(join(MODEL_DIR, "auth/Model_Send_Code_Again"));

exports.sendCodeAgain = (req, res, next) => {
	if (!req.body.email || !(req.body.rd && checkRDParam(req.body.rd, req.body.verify))) {
		return res.json({
			success: false,
			message: "Invalid request."
		});
	}

	checkUser(req.body.email, req.body.rd)
		.then(({ info }) => {
			return res.json({
				message: info
			});
		})
		.catch(err => next(err));
};

function checkRDParam(rd, routeVerify) {
	let now = dateTime.addHours(new Date(), 6);
	return rd.slice(15) > now.getTime() && rd.slice(8, 15) === `${dateTime.format(now, "DD")}${routeVerify === "verify" ? "abd" : "ace"}${dateTime.format(now, "MM")}`;
}

// FOR DEBUG:
// console.log( rd );
// console.log( routeVerify );
// console.log( typeof routeVerify );
// console.log( rd.slice( 15 ) );
// console.log( now.getTime() );
// console.log( rd.slice( 15 ) > now.getTime() );
// console.log( rd.slice( 8, 15 ) );
// console.log( `${dateTime.format(now, 'DD')}${routeVerify?'abd':'ace'}${dateTime.format(now, 'MM')}` );
// console.log( rd.slice( 8, 15 ) === `${dateTime.format(now, 'DD')}${routeVerify?'abd':'ace'}${dateTime.format(now, 'MM')}` );
