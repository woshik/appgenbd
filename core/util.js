"use strict";

const winstonDailyRotateFile = require( 'winston-daily-rotate-file' )
const {
	createLogger,
	format,
	transports
} = require( 'winston' )
const {
	align,
	combine,
	timestamp,
	printf
} = format
const bcrypt = require( 'bcryptjs' )
const nodemailer = require( "nodemailer" )
const config = require( "config" )

exports.sendMail = ( recipient, subject, text, callback = null ) => {
	let transport = nodemailer.createTransport( {
		host: config.get( "mail.host" ),
		port: config.get( "mail.send_port" ),
		secure: true,
		auth: {
			user: config.get( "mail.username" ),
			pass: config.get( "mail.password" )
		}
	} )

	return new Promise( ( resolve, reject ) => {
		transport.sendMail( {
				from: `${config.get("mail.sender_mail")}`,
				to: recipient,
				subject: subject,
				text: `${text}`
			} )
			.then( reponse => {
				resolve( reponse )
			} )
			.catch( err => {
				reject( err )
			} )
	} )
}

exports.fromErrorMessage = error => {
	switch ( error.type ) {
	case "string.empty":
		return `${error.context.label} is required`
	case "string.pattern.base":
		if ( error.path[ 0 ] === "name" ) {
			return `${error.context.label} contains only characters`
		} else {
			return `Enter valid ${error.context.label.toLowerCase()}`;
		}
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
		case "date.greater":
			return `Date must be greater than today`
		case "date.base":
			return "Please, enter valid date."
		case "number.base":
			return `Please, enter valid ${error.context.label.toLowerCase()}`
		default:
			return error.message
	}
}

exports.hashPassword = ( password ) => {
	return new Promise( ( resolve, reject ) => {
		bcrypt.genSalt( 10 )
			.then( getSalt => {
				bcrypt.hash( password, getSalt )
					.then( hashPassword => resolve( hashPassword ) )
					.catch( err => reject( err ) )
			} )
			.catch( err => reject( err ) )
	} )
}

exports.logger = createLogger( {
	format: combine(
		timestamp(),
		align(),
		printf(
			error => `${error.timestamp} ${error.level}: ${error}`
		)
	),
	transports: [
        new winstonDailyRotateFile( {
			filename: join( __dirname, '..', 'error', 'error-%DATE%.log' ),
			datePattern: 'DD-MM-YYYY',
			level: 'error'
		} ),
    ]
} )

exports.companyInfo = {
	appName: config.get( 'app_name' ),
	company: config.get( 'company_name' ),
	website: config.get( 'company_website' ),
}
