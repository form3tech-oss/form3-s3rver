"use strict";

const winston = require("winston");

const log = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: "debug",
            humanReadableUnhandledException: true,
            handleExceptions: true,
            json: false,
            colorize: true,
            label: "Form3-S3"
        })
    ],
    exitOnError: false
});


module.exports = log;
