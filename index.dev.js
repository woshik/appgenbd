"use strict";

global.join = require("path").join;
global.BASE_DIR = __dirname;

require(join(BASE_DIR, "bootstrap", "app"));
