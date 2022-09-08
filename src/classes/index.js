// Merge all the class files here.

// Bring in the classFactory function.
const classFactory = require('./classFactory');

// Get the User class from its definition.
const {User} = require("./user");

// Get the adminClass function that takes in a User class and returns an Admin class.
const {adminClass} = require("./admin");

// Export the return result of the classFactory function that takes in a User and an Admin class.
module.exports = classFactory(User, adminClass(User));
