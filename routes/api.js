const express = require('express')
const router = express.Router()
const config = require('config')

// controller importing
const ussd = require(path.join(CONTROLLER_BASEDIR, "api", "ussd"))

router.post(api.ussd, ussd);

module.exports = router;