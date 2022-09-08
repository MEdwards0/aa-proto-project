// Combines all the database folder files into one place.

const handlerFactory = require('./controller');

// get all the definitions of the primary implementations of the functions.
const model = require('./model');

// export the result of handler factory taking in the model.
module.exports = handlerFactory(model);
