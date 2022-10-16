// This file handles the views for the application. it depends on database calls, claim functionality, and Claim functionality
// const database = require('../database');
const { User, Admin } = require("../classes");
// const { addClassMethods } = require('../classes/methods');
const controller = {
    database: require('../database'),
    addClassMethods: require('../classes/methods'),
    claim: require('../claim'),
    User: User,
    Admin: Admin
};
// const claim = require('../claim');



const activateAccountSubmit = require('./routes/activateAccountSubmit')(controller);
const addCustomerForm = require('./routes/addCustomerForm')(controller);
const addCustomerSecurityForm = require('./routes/addCustomerSecurityForm')(controller);
const addCustomerSubmit = require('./routes/addCustomerSubmit')(controller);
const adminHome = require('./routes/adminHome')(controller);
const checkSecurityQuestions = require('./routes/checkSecurityQuestions')(controller);
const createUser = require('./routes/createUser')(controller);
const displayLogInPage = require('./routes/displayLogInPage')(controller);
const displayUserHome = require('./routes/displayUserHome')(controller);
const logOut = require('./routes/logOut')(controller);
const makeAccountAdminSubmit = require('./routes/makeAccountAdminSubmit')(controller);
const manageUsers = require('./routes/manageUsers')(controller);
const processCustomer = require('./routes/processCustomer')(controller);
const signIn = require('./routes/signIn')(controller, User, Admin);
const submitApplication = require('./routes/submitApplication')(controller);
const validateNino = require('./routes/validateNino')(controller);
const validateNinoForm = require('./routes/validateNinoForm')(controller);
const viewCustomerData = require('./routes/viewCustomerData')(controller);

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
