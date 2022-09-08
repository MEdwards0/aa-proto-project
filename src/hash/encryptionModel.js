// This file is responsible for encrypting information. Relies on a node module of bcrypt. 

const encrypt = require('bcrypt');

// Encrypt inputted data, returning hashed value.

const encryptInput = (input) => {
    const saltRounds = 10;
    return encrypt.hash(input, saltRounds);
}

// Takes an input, and encrypts it, then checks that against an inputted hash value. Returns true or false.

const checkEncryption = (input, hash) => {
    return encrypt.compare(input, hash);
}

// Export both functions here.

module.exports = {encryptInput, checkEncryption};
