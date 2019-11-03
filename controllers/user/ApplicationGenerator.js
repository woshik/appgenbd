const sidebar = require(join(BASE_DIR, 'urlconf', 'sideBar'))
const PDFDocument = require('pdfkit')
const fs = require('fs')

const applicationGeneratorView = (req, res, next) => {
    let app = new model("app");
    app.find({ user_id: req.user._id }, { app_name: 1, _id: 0 })
        .then(result => {
            let applicationGeneratorData = {
                info: commonInfo,
                title: 'Application Generator',
                userName: req.user.name,
                email: req.user.email,
                sidebar: sidebar,
                path: req.path,
                csrfToken: req.csrfToken(),
                appList: result,
                applicationGeneratorForm: web.applicationGenerator.url,
            }

            res.render("user/applicationGenerator", applicationGeneratorData)
        })
        .catch(err => next(err))
}

const applicationGenerator = (req, res, next) => {
    const schema = Joi.object({
        appName: Joi.string().trim().required().label("App name"),
        smsKeyword: Joi.string().trim().required().label("SMS keyword"),
        ussdcode: Joi.string().trim().required().label("USSD code"),
        perDaySms: Joi.number().min(1).required().label("sms delivery number"),
        longDescription: Joi.string().trim().required().label("Long description"),
        shortDescription: Joi.string().trim().required().label("Short description"),
    })

    const validateResult = schema.validate({
        appName: req.body.appName,
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

    const doc = new PDFDocument({
        autoFirstPage: false
    })

    doc.pipe(fs.createWriteStream(join(BASE_DIR, 'pdf', `${validateResult.value.appName}.pdf`)))

    doc.addPage({
        margins: {
            top: 40,
            bottom: 0,
            left: 35,
            right: 35
        }
    })

    doc.rect(20, 20, 572, 752)
        .lineWidth(2)
        .strokeColor('#1abc9c')
        .stroke();

    doc.fontSize(20).text(validateResult.value.appName, {
        align: 'center'
    })

    doc.moveDown(.1)
    doc.fontSize(10).text('Powered by AppGenBD', {
        align: 'center',
    })

    doc.fontSize(12)
        .text(validateResult.value.longDescription, 35, 90)

    doc.moveDown(1)
    doc.fontSize(12).text('How to Subscribe:')
    doc.fontSize(12).list([
        [
            `SMS: User will have to type "${validateResult.value.smsKeyword}" and send to 21213 to complete the subscription.`,
            `USSD: Dial ${validateResult.value.smsKeyword} then press 1 (TBD) to subscribe.`,
            `Other mode: N/A`
        ]
    ])

    doc.fontSize(12).text('How to Unsubscribe:')
    doc.fontSize(12).list([
        [
            `SMS: User will have to type "${validateResult.value.smsKeyword}" and send to 21213 to complete the unsubscription.`,
            `USSD: Dial ${validateResult.value.smsKeyword} then press 1 (TBD) to unsubscribe.`,
            `Other mode: N/A`
        ]
    ])

    doc.fontSize(12).text('Charge:')
    doc.fontSize(12).text('TK 2 + (VAT + SD + SC)/SMS wih Auto Renewal')

    doc.fontSize(12).list([
        [
            `This is a subscription based <Please mention the type> service.`,
            `Subscription charge will cost ${2 * parseInt(validateResult.value.perDaySms)} + (VAT + SD + SC)/ day SMS wih Auto Renewal`,
        ]
    ])

    doc.fontSize(12).text('Offer details:')
    doc.fontSize(12).text(`${validateResult.value.perDaySms} SMS per day`)

    doc.fontSize(12).text('Support contact:')
    doc.fontSize(12).text(`${req.user.name}`)
    doc.fontSize(12).text(`${req.user.email}`)

    doc.end()

    return res.status(200).json({
        success: true,
        message: web.download.url.replace(':fileName', validateResult.value.appName)
    })
}

download = (req, res, next) => {
    res.download(join(BASE_DIR, 'pdf', `${req.params.fileName}.pdf`), `${req.params.fileName}.pdf`, err => {
        if (err) {
            next(err)
        } else {
            fs.unlink(join(BASE_DIR, 'pdf', `${req.params.fileName}.pdf`), err => {
                if (err) next(err)
            })
        }
    })
}

module.exports = {
    applicationGeneratorView,
    applicationGenerator,
    download
}