global.Joi = require('@hapi/joi')
global.dateTime = require('date-and-time')

global.web = require(join(BASE_DIR, 'urlconf', 'webRule'))
global.api = require(join(BASE_DIR, 'urlconf', 'apiRule'))
global.commonInfo = require(join(BASE_DIR, 'core', 'util')).commonInfo
global.fromErrorMessage = require(join(BASE_DIR, 'core', 'util')).fromErrorMessage

