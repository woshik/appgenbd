const PDFDocument = require('pdfkit')
const fs = require('fs')

const applicationGeneratorView = (req, res, next) => {
	res.render("user/applicationGenerator", {
	    info: commonInfo,
	    title: 'Application Generator',
	    userName: req.user.name,
	    email: req.user.email,
	    sidebar: sidebar,
	    path: req.path,
	    csrfToken: req.csrfToken(),
	    applicationGeneratorForm: web.applicationGenerator.url,
	});
};

const applicationGenerator = (req, res, next) => {
	const schema = Joi.object({
        username: Joi.string().trim().required().label("Name"),
        email: Joi.string().trim().email().required().label("Email address"),
        appName: Joi.string().trim().required().label("App name"),
        appId: Joi.string().trim().required().label("App id"),
        smsKeyword: Joi.string().trim().required().label("SMS keyword"),
        ussdcode: Joi.string().trim().required().label("USSD code"),
        perDaySms: Joi.number().min(1).max(10).required().label("SMS Offer Per Day"),
        longDescription: Joi.string().trim().required().label("Long description"),
        shortDescription: Joi.string().trim().required().label("Short description"),
    })

    const validateResult = schema.validate({
        username: req.body.username,
        email: req.body.email,
        appName: req.body.appName,
        appId: req.body.appId,
        smsKeyword: req.body.smsKeyword,
        ussdcode: req.body.ussdcode,
        perDaySms: req.body.perDaySms,
        longDescription: req.body.longDescription,
        shortDescription: req.body.shortDescription
    })

    if (validateResult.error) {
        return res.status(200).json({
            success: false,
            message: fromErrorMessage(validateResult.error.details[0])
        })
    }

    const doc = new PDFDocument
    doc.pipe(fs.createWriteStream(join(__dirname, '../../', 'pdf', 'output.pdf')))
}

module.exports = {
	applicationGeneratorView,
	applicationGenerator
}