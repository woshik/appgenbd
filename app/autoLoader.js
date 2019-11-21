global.dateTime = require('date-and-time')
global.Joi = require('@hapi/joi')
global.web = require(join(BASE_DIR, 'urlconf', 'webRule'))
global.api = require(join(BASE_DIR, 'urlconf', 'apiRule'))
global.companyInfo = require(join(BASE_DIR, 'core', 'util')).companyInfo
global.fromErrorMessage = require(join(BASE_DIR, 'core', 'util')).fromErrorMessage

let entities = new require('html-entities').AllHtmlEntities
global.encode = entities.encode