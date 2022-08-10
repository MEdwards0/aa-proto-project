const encrypt = require('bcrypt');

const encryptPassword = (password) => {
    const saltRounds = 10;
    return encrypt.hash(password, saltRounds);
}

const comparePassword = (password, hash) => {
    return encrypt.compare(password, hash);
}

module.exports = {encryptPassword, comparePassword};
