const encrypt = require('bcrypt');

const encryptInput = (input) => {
    const saltRounds = 10;
    return encrypt.hash(input, saltRounds);
}

const checkEncryption = (input, hash) => {
    return encrypt.compare(input, hash);
}

module.exports = {encryptInput, checkEncryption};
