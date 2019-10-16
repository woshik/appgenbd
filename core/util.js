const winstonDailyRotateFile = require('winston-daily-rotate-file')
const { createLogger, format, transports } = require('winston')
const { align, combine, timestamp, printf } = format
const nodemailer = require("nodemailer")
const config = require("config")
const bcrypt = require('bcryptjs')
const { join } = require('path')

exports.sendMail = (recipient, subject, text, callback = null) => {
    let transport = nodemailer.createTransport({
        host: config.get("mail.host"),
        port: config.get("mail.send_port"),
        secure: true,
        auth: {
            user: config.get("mail.username"),
            pass: config.get("mail.password")
        }
    })

    return new Promise((resolve, reject) => {
        transport.sendMail({
                from: `${config.get("mail.sender_mail")}`,
                to: recipient,
                subject: subject,
                text: `${text}`
            })
            .then(reponse => {
                resolve(reponse)
            })
            .catch(err => {
                reject(err)
            })
    })
}

exports.fromErrorMessage = error => {
    switch (error.type) {
        case "string.empty":
            return `${error.context.label} is required`
        case "string.pattern.base":
            if (error.path[0] === "name")
                return `${error.context.label} contains only characters`
            if (error.path[0] === "number" || error.path[0] === "code")
                return `Enter valid ${error.context.label}`;
        case "string.email":
            return "Enter valid mail address"
        case "string.min":
            return `${error.context.label} contain minimum 5 characters`
        case "string.mix":
            return `${error.context.label} contain maximum 5 characters`
        case "any.only":
            return "Confirm password doesn't match"
        case "any.required":
            return `${error.context.label} is required`
        default:
            return error.message
    }
}

exports.hashPassword = (password) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(10)
            .then(getSalt => {
                bcrypt.hash(password, getSalt)
                    .then(hashPassword => {
                        resolve(hashPassword);
                    })
                    .catch(err => {
                        reject(err);
                    });
            })
            .catch(err => {
                reject(err);
            });
    });
}

exports.logger = createLogger({
    format: combine(
        timestamp(),
        align(),
        printf(
            info => `${info.timestamp} ${info.level}: ${info.message}`
        )
    ),
    transports: [
        new winstonDailyRotateFile({
            filename: join(__dirname, '..', 'error', 'error-%DATE%.log'),
            datePattern: 'DD-MM-YYYY',
            level: 'error'
        }),
    ]
})

exports.flash = () => {
    return function(req, res, next) {
        if (req.flash && safe) { return next(); }
        req.flash = function(type, msg) {
            if (this.session === undefined) throw Error('req.flash() requires sessions');
            let msgs = this.session.flash = this.session.flash || {};
            if (type && msg) {
                return msgs[type] = msg;
            } else if (type) {
                let arr = msgs[type];
                delete msgs[type];
                return arr || false;
            } else {
                this.session.flash = {};
                return msgs;
            }
        }
        next();
    }
}




exports.commonInfo = {
    appName: config.get('app_name'),
    company: config.get('company'),
    website: config.get('link'),
}