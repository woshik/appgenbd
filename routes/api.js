const express = require('express');
const router = express.Router();
const path = require('path');
const config = require('config');

const { api } = require(path.join(__dirname, '../', 'util', 'urls'));

const CONTROLLER_BASEDIR = path.join(__dirname, '../', 'application', 'controllers');

// controller importing
const ussd = require(path.join(CONTROLLER_BASEDIR, "api", "ussd"));

router.post(api.ussd, ussd);

module.exports = router;