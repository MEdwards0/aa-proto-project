const handlerFactory = require('./controller');

const model = require('./model');

module.exports = handlerFactory(model);
