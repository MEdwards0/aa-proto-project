const {client} = require('./connection');
const { encryptInput, checkEncryption } = require('../hash/encryptionModel');


// Combines all the database folder files into one place.

const handlerFactory = require('./controller');

// get all the definitions of the primary implementations of the functions.
const databaseModel = require('./model');

// export the result of handler factory taking in the model.
module.exports = handlerFactory(databaseModel(client, encryptInput, checkEncryption));
