const classFactory = require('./classFactory');
const {User} = require("./user");
const {adminClass} = require("./admin");


module.exports = classFactory(User, adminClass(User));
