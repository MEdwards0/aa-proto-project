// This file handles the views for the application. it depends on database calls, claim functionality, and Claim functionality

const { User, Admin } = require("../classes");
const {log} = require('../logging');

const controller = {
    database: require('../database'),
    addClassMethods: require('../classes/methods'),
    claim: require('../claim'),
    User: User,
    Admin: Admin
};

const activateAccountSubmit = require('./routes/activateAccountSubmit')(controller, log);
const addCustomerForm = require('./routes/addCustomerForm')(controller, log);
const addCustomerSecurityForm = require('./routes/addCustomerSecurityForm')(controller);
const addCustomerSubmit = require('./routes/addCustomerSubmit')(controller);
const adminHome = require('./routes/adminHome')(controller, log);
const checkSecurityQuestions = require('./routes/checkSecurityQuestions')(controller, log);
const createUser = require('./routes/createUser')(controller, log);
const displayLogInPage = require('./routes/displayLogInPage')(controller, log);
const displayUserHome = require('./routes/displayUserHome')(controller, log);
const logOut = require('./routes/logOut')(controller, log);
const makeAccountAdminSubmit = require('./routes/makeAccountAdminSubmit')(controller, log);
const manageUsers = require('./routes/manageUsers')(controller, log);
const processCustomer = require('./routes/processCustomer')(controller, log);
const signIn = require('./routes/signIn')(controller, log);
const submitApplication = require('./routes/submitApplication')(controller, log);
const validateNino = require('./routes/validateNino')(controller, log);
const validateNinoForm = require('./routes/validateNinoForm')(controller, log);
const viewCustomerData = require('./routes/viewCustomerData')(controller, log);

const handler = () => {

    return {
        activateAccountSubmit,
        addCustomerForm,
        addCustomerSecurityForm,
        addCustomerSubmit,
        adminHome,
        checkSecurityQuestions,
        createUser,
        displayLogInPage,
        displayUserHome,
        logOut,
        makeAccountAdminSubmit,
        manageUsers,
        processCustomer,
        signIn,
        submitApplication,
        validateNino,
        validateNinoForm,
        viewCustomerData,

    };
};

// Export the return result of calling the handler function.

module.exports = handler();
