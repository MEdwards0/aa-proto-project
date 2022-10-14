const { logLevel } = require('../config');

const dwpNodeLogger = require('@dwp/node-logger');

const logger = dwpNodeLogger('web', { logLevel: logLevel });

const log = (req) => {
    return {
        trace: (message) => {
            req.log.trace(message) || logger.trace(message);
        },
        debug: (message) => {
            req.log.debug(message) || logger.debug(message);
        },
        info: (message) => {
            req.log.info(message) || logger.info(message);
        },
        warn: (message) => {
            req.log.warn(message) || logger.warn(message);
        },
        error: (message) => {
            req.log.error(message) || logger.error(message);
        },
        fatal: (message) => {
            req.log.fatal(message) || logger.fatal(message);
        },
    };
};

module.exports = { logger, log };
