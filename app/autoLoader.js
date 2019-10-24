global.joi = require('@hapi/joi')
global.bcrypt = require('bcryptjs')
global.crypto = require('crypto')
global.dateTime = require('date-and-time')
global.passport = require("passport")
global.ObjectId = require('mongodb')

global.model = require(join(BASE_DIR, 'db', 'model'))
global.web = require(join(BASE_DIR, 'urlconf', 'webRule'))
global.api = require(join(BASE_DIR, 'urlconf', 'apiRule'))
global.sideBar = require(join(BASE_DIR, 'urlconf', 'sideBar'))
global.commonInfo = require(join(BASE_DIR, 'core', 'util')).commonInfo
global.fromErrorMessage = require(join(BASE_DIR, 'core', 'util')).fromErrorMessage
global.hashPassword = require(join(BASE_DIR, 'core', 'util')).hashPassword
global.sendMail = require(join(BASE_DIR, 'core', 'util')).sendMail
global.logger = require(join(BASE_DIR, 'core', 'util')).logger