"use strict";

const {
	randomBytes
} = require( 'crypto' )
const dateTime = require( 'date-and-time' )
const {
	sendMail
} = require( join( BASE_DIR, 'core/util' ) )
