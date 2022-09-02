const database = require('../database');
const claim = require('../claim');
const { User, Admin } = require("../classes");
const { addClassMethods } = require('../classes/methods');

const handler = () => {

    const displayUserHome = async (req, res) => {

        const user = req.session.class;

        if (user == undefined) {
            res.redirect('/');
            return;
        } else {
            addClassMethods(user);
        }

        try {
            // addClassMethods(user);
            if (user.token != undefined && user.activeAccount && user.loggedIn) {
                const profile = {
                    username: user.username,
                    userLevel: user.userLevel
                    // id: req.session.id
                };

                const result = await database.handleGetToken(user.token, user.username);

                console.log('User level is:', user.userLevel)
                result.status ? res.render('user_home', { profile: profile }) : res.redirect('/log-out');

            } else {
                req.session.destroy();
                res.redirect('/');
            };

        } catch (error) {
            console.log(error);
            req.session.destroy(); // destroy the current session.
            res.redirect('/');
        };
    };

    const logInPage = async (req, res) => {
        try {
            const user = req.session.class;

            if (user == undefined || user.token == undefined) {
                console.log('user or token not defined.');
                const page = { error: true, activeAccount: true };
                res.render('login', { error: page });

            } else {
                console.log();
                addClassMethods(user); // just adding class methods here in case they are to be used at any point in this route.
                const result = await database.handleGetToken(user.token, user.username);
                if (!result.status) {
                    req.session.destroy(); // destroy the current session.
                    const page = { error: true }
                    res.render('login', { error: page });
                } else {
                    res.redirect('/user-home');
                };
            };
        } catch (error) {
            console.log(error);
            const page = { error: false }
            res.render('login', { error: page });
        };
    };

    const resetPasswordForm = (req, res) => {
        res.render('forgot_password');
    };

    const resetPassword = (req, res) => {
        res.render('confirm_password_reset');
    };

    const createUserForm = (req, res) => {
        res.render('create_user');
    };

    const createUser = async (req, res) => {
        const { username, password } = req.body;
        const result = await database.handleAddUser(username, password);

        if (result.status) {
            res.render('confirm_user_created');
        } else {
            res.send('Error creating user');
        }
    };

    const signIn = async (req, res) => {
        let user; // set to contain user class
        const { username, password } = req.body;
        const result = await database.handleLogIn(username, password);

        // Check the user account level if there is one to be found:
        console.log(`result.error is : ${result.error}`);
        if (!result.error) {
            // req.session.token = result.token;
            // req.session.username = result.profile.username;

            // assign the user the correct class depending on admin level.

            console.log(`result.admin is ${result.profile.admin}`);

            if (result.profile.admin) {
                req.session.class = req.session.id = new Admin(username, password, result.profile.accountActive);
                user = req.session.class; // set the user class here

                req.session.id = new Admin(username, password, result.profile.accountActive);
            } else {
                req.session.class = req.session.id = new User(username, password, result.profile.accountActive);
                user = req.session.class; // set the user class here

                req.session.id = new User(username, password, result.profile.accountActive);
            };

            // console.log(`User's ActiveAccount status is: ${user.activeAccount}`);

            user.setToken(result.token);
            user.logIn();

            if (user.activeAccount) {
                res.redirect('user-home');
            } else {
                const page = { error: true, activeAccount: user.activeAccount }
                res.render('login', { page: page })
            };

            // res.redirect('user-home');
        } else {
            console.log('In signin section else block');
            const page = { error: result.error, activeAccount: true };
            console.log(`page.error is: ${page.error}`);
            res.render('login', { page: page });
        };
    };

    const logOut = async (req, res) => {
        try {
            const user = req.session.class;
            addClassMethods(user);

            await database.handleRemoveToken(user.token);
            user.removeCustomerInfo();
            user.clearToken();
            user.logOut();

            console.log('logging out.')
            req.session.destroy();
            console.log('going to home screen'); // destroy the current session.
            res.redirect('/');
        } catch (error) {
            console.log('error');
            req.session.destroy();
            res.redirect('/');
        };

    };

    const validateNinoForm = async (req, res) => {
        const user = req.session.class;

        if (user == undefined) {
            res.redirect('/');
            return;
        } else {
            addClassMethods(user);
        }

        if (user.token != undefined && user.activeAccount && user.loggedIn) {
            try {
                const result = await database.handleGetToken(user.token, user.username);

                const page = {
                    route: req.params.route,
                    error: false,
                    username: user.username
                };

                result.status ? res.render('validate_nino', { page: page }) : res.redirect('/log-out');

            } catch (error) {
                console.log(error);
                req.session.destroy(); // destroy the current session.
                res.redirect('/');
            };
        } else {
            res.redirect('/');
        }
    };

    const validateNino = async (req, res) => {
        const user = req.session.class;
        // If there is no user in the session, go back to log in.
        if (user == undefined) {
            res.redirect('/');
            return;
        } else {
            addClassMethods(user);
        };

        user.sayHello();

        if (user.token != undefined && user.activeAccount && user.loggedIn) {
            try {
                const result = await database.handleGetToken(user.token, user.username);
                if (!result.error) {
                    const response = await database.handleValidateNino(req.body.nino);


                    const page = {
                        nino: req.body.nino,
                        route: req.params.route,
                        error: response.error,
                        username: user.username
                    };

                    const customer = await database.handleGetCustomer(page.nino);

                    if (customer.error) {
                        page.error = customer.error;
                        console.log('There was an error getting the customer information');
                        console.log(customer.errorMessage);
                    }

                    page.customerName = customer.name;
                    page.customerSurname = customer.surname;
                    page.dob = customer.dob;

                    if (page.error) {
                        res.render('validate_nino', { page: page });
                    } else {
                        const result = await database.handleGetSecurityQuestions(req.body.nino);
                        // finally trust for the nino to be put in cookies
                        // res.cookie('nino', req.body.nino);
                        console.log(user.setCustomerNino);

                        user.setCustomerNino(req.body.nino);
                        page.questions = result.questions;
                        res.render('security_questions', { page: page });
                    }
                };

            } catch (error) {
                console.log(error);
                req.session.destroy(); // destroy the current session.
                res.redirect('/');
            };
        } else {
            // req.session.destroy(); // destroy the current session.
            res.redirect('/');
        }
    };

    const checkSecurityQuestions = async (req, res) => {
        const user = req.session.class;

        if (user == undefined) {
            res.redirect('/');
            return;
        } else {
            addClassMethods(user);
        };

        if (user.token != undefined && user.activeAccount && user.loggedIn) {
            try {
                const token = await database.handleGetToken(user.token, user.username);

                page = {
                    nino: user.customerNino,
                    route: req.params.route,
                    error: token.error,
                    username: user.username
                }

                if (!token.error) {

                    // console.log('DEBUG: checkSecurityAnswers', user.customerNino, req.body.answerOne, req.body.answerTwo, req.body.answerThree)

                    const result = await database.handleCheckSecurityAnswers(user.customerNino, req.body.answerOne, req.body.answerTwo, req.body.answerThree);

                    page.error = result.error;

                    const customer = await database.handleGetCustomer(page.nino);

                    if (customer.error) {
                        page.error = customer.error;
                        console.log('There was an error getting the customer information');
                        console.log(customer.errorMessage);
                    }

                    page.customerName = customer.name;
                    page.customerSurname = customer.surname;
                    page.dob = customer.dob;

                    if (page.error) {
                        const questions = await database.handleGetSecurityQuestions(page.nino);
                        page.questions = questions.questions;

                        res.render('security_questions', { page: page });

                    } else {

                        // Issue new access token for customer information here.
                        const token = await database.handleAddNewCustomerAccessToken(user.username, user.customerNino);
                        // Set the customer access token to the user class
                        user.setCustomerAccessToken(token)
                        // req.session.customerAccessToken = token;

                        res.redirect(`/view-customer-data/${page.nino}`);
                    };
                }
            } catch (error) {
                console.log(error);
                req.session.destroy(); // destroy the current session.
                res.redirect('/');
            }
        } else {
            res.redirect('/');
        }
    };

    const processCustomer = async (req, res) => {
        const user = req.session.class;

        if (user == undefined) {
            res.redirect('/');
            return;
        } else {
            addClassMethods(user);
        }

        // addClassMethods(user);

        if (user.token != undefined && user.activeAccount && user.loggedIn) {
            try {
                const page = {
                    nino: user.customerNino,
                    username: user.username,
                    error: false
                }

                // check token validity
                const result = await database.handleGetToken(user.token, user.username);
                // console.log(`GATE: getToken. Result is: ${result.error}. Should be false.`);
                result.error ? page.error = true : page.error = page.error;

                // check nino validity
                const nino = await database.handleValidateNino(user.customerNino);
                // console.log(`GATE: validateNino. Result is: ${nino.error}. Should be false.`);
                nino.error ? page.error = true : page.error = page.error;

                // check nobody fiddled with the cookies
                user.customerNino == req.params.nino ? page.error = page.error : page.error = true;
                // console.log(`GATE: check cookies nino against url nino. Result is: ${req.cookies.nino == req.params.nino}. Should be true.`);

                // check security questions
                const security = await database.handleCheckCustomerAccessToken(user.customerAccessToken, user.username, user.customerNino);
                // console.log(`GATE: checkSecurityAnswers. Result is: ${security.error}. Should be false.`);
                security.error ? page.error = true : page.error = page.error;

                // get customer information for the page rendering here:

                const customer = await database.handleGetCustomer(page.nino);

                if (customer.error) {
                    console.log('There was an error getting the customer information');
                    page.error = customer.error;
                    console.log(customer.errorMessage);
                }

                page.customerName = customer.name;
                page.customerSurname = customer.surname;
                page.dob = customer.dob;

                if (page.error) {
                    res.redirect('/');
                } else {
                    res.render('new_claim', { page: page });
                    // res.send('success: render process_customer page');
                };
            } catch (error) {
                console.log(error);
                req.session.destroy(); // destroy the current session.
                res.redirect('/');
            };
        } else {
            res.redirect('/');
        }
    };

    const viewCustomerData = async (req, res) => {
        const user = req.session.class;

        if (user == undefined) {
            res.redirect('/');
            return;
        } else {
            addClassMethods(user);
        }

        // addClassMethods(user);

        console.log('ATTEMPTING TO VIEW CUSTOMER DATA')

        console.log(`user.token is: ${req.session.token}, user.activeAccount is: ${user.activeAccount}, user.loogedIn is ${user.loggedIn}`);

        if (user.token != undefined && user.activeAccount && user.loggedIn) {
            try {

                const page = {
                    nino: user.customerNino,
                    username: user.username,
                    error: false
                }

                console.log('Checking token:');

                // check token validity
                const result = await database.handleGetToken(user.token, user.username);
                // console.log(`GATE: getToken. Result is: ${result.error}. Should be false.`);
                result.error ? page.error = true : page.error = page.error;

                console.log('result.error is:', result.error);

                console.log('checking nino');

                // check nino validity
                const nino = await database.handleValidateNino(user.customerNino);
                // console.log(`GATE: validateNino. Result is: ${nino.error}. Should be false.`);
                nino.error ? page.error = true : page.error = page.error;

                console.log(`nino.error is: ${nino.error}`);
                // check nobody fiddled with the cookies
                user.customerNino == req.params.nino ? page.error = page.error : page.error = true;
                // console.log(`GATE: check cookies nino against url nino. Result is: ${req.cookies.nino == req.params.nino}. Should be true.`);

                console.log('Checking access token:');
                // check security questions
                const security = await database.handleCheckCustomerAccessToken(user.customerAccessToken, user.username, user.customerNino);
                // console.log(`GATE: checkCustomerAccessToken. Result is: ${security.error}. Should be false.`);
                security.error ? page.error = true : page.error = page.error;

                console.log(`security.error is: ${security.error}`);

                console.log(`checking customer response:`)

                const customer = await database.handleGetCustomer(page.nino);

                console.log(`customer.error is: ${customer.error}}`);

                if (customer.error) {
                    console.log('There was an error getting the customer information');
                    page.error = customer.error;
                    console.log(customer.errorMessage);
                };

                page.customerName = customer.name;
                page.customerSurname = customer.surname;
                page.dob = customer.dob;
                page.dod = customer.dod;
                page.claimDateStart = customer.claimDateStart;
                page.claimDateEnd = customer.claimDateEnd;
                page.awardRate = customer.awardRate;
                page.claimedAA = customer.claimedAA;
                page.rateCode = customer.rateCode

                if (page.error) {
                    res.redirect('/');
                } else {
                    console.log('RENDERING VIEW_CUSTOMER_DATA')
                    res.render('view_customer_data', { page: page });
                    // res.send('success: render view_customer_data page');
                };
            } catch (error) {
                console.log(error);
                req.session.destroy(); // destroy the current session.
                res.redirect('/');
            };
        } else {
            res.redirect('/');
        }
    };

    const submitApplication = async (req, res) => {
        const user = req.session.class;

        if (user == undefined) {
            res.redirect('/');
            return;
        } else {
            addClassMethods(user);
        }

        // addClassMethods(user);

        if (user.token != undefined && user.activeAccount && user.loggedIn) {
            try {

                const page = {
                    nino: user.customerNino,
                    username: user.username,
                    claimMessage: 'none',
                    error: false
                }

                // check token validity
                const result = await database.handleGetToken(user.token, user.username);
                // console.log(`GATE: getToken. Result is: ${result.error}. Should be false.`);
                result.error ? page.error = true : page.error = page.error;

                // check nino validity
                const nino = await database.handleValidateNino(user.customerNino);
                // console.log(`GATE: validateNino. Result is: ${nino.error}. Should be false.`);
                nino.error ? page.error = true : page.error = page.error;

                // check nobody fiddled with the cookies
                user.customerNino == req.params.nino ? page.error = page.error : page.error = true;
                // console.log(`GATE: check cookies nino against url nino. Result is: ${req.cookies.nino == req.params.nino}. Should be true.`);

                // do claim logic here, returns an object with an error and a claim message, if error is true, there was an error.
                const application = claim.processClaim(req);

                if (application.error) {
                    page.error = true;
                    page.databaseError = false;
                };

                // Get response message to display to user
                page.claimMessage = application.message;

                if (page.error) {

                    res.render('failure_screen', { page: page });
                } else {

                    const newClaim = {
                        nino: page.nino,
                        awardRate: req.body.careLevelSubmit
                    };

                    // Update cutomer table with claim details.
                    const response = await database.handleUpdateClaim(newClaim);

                    if (response.error) {
                        console.log(response.errorMessage);
                        page.databaseError = response.error;
                        page.claimMessage = 'There was an error updating the database';
                        res.render('failure_screen', { page: page });
                    } else {
                        res.render('success_screen', { page: page });
                    };

                };
            } catch (error) {
                console.log(error);
                req.session.destroy(); // destroy the current session.
                res.redirect('/');
            };
        } else {
            res.redirect('/');
        }
    };

    const addCustomerForm = async (req, res) => {
        const page = {
            error: false
        };

        res.render('new_customer', { page: page });
    };

    const addCustomerSecurityForm = async (req, res) => {

        const dob = new Date(req.body.dobYear, Number(req.body.dobMonth) - 1, req.body.dobDay);

        const page = {
            fName: req.body.fName,
            mName: req.body.mName || null,
            lName: req.body.lName,
            dob: dob,
            nino: req.body.nino
        };

        const result = await database.handleValidateNino(req.body.nino);

        // Validate nino length

        if (page.nino.length != 9) {
            result.message = 'wrong nino length';
        }

        // We want result.error to be true, so we know that there is not a nino in the db and a message so it wasnt because of another error.
        if (result.error && result.message == 'undefined') {
            req.session.nino = req.body.nino;
            req.session.fName = page.fName;
            req.session.lName = page.lName;
            req.session.dob = page.dob;

            res.render('new_customer_security', { page: page });

        } else {
            page.error = true;
            res.render('new_customer', { page: page });
        };
    };

    const addCustomerSubmit = async (req, res) => {
        const result = await database.handleValidateNino(req.session.nino);

        // Any error will result in a true condition. If the db is broken for instance.
        if (result.error && result.message == 'undefined') {

            const customer = {
                NINO: req.session.nino,
                fName: req.session.fName,
                mName: req.session.mName || null,
                lName: req.session.lName,
                dob: req.session.dob,
                questionOne: req.body.questionOne,
                questionTwo: req.body.questionTwo,
                questionThree: req.body.questionThree,
                answerOne: req.body.answerOne,
                answerTwo: req.body.answerTwo,
                answerThree: req.body.answerThree
            };

            const result = await database.handleAddNewCustomer(customer)

            if (!result.error) {
                res.render('confirm_user_created');
            } else {
                res.send('error creating a customer.', result.errorMessage)
            }
        }
    };

    const adminHome = (req, res) => {
        const user = req.session.class;

        if (user == undefined) {
            res.redirect('/');
            return
        } else {
            addClassMethods(user);
        };

        if (user.token != undefined && user.activeAccount && user.loggedIn && user.userLevel == 'admin') {
            try {
                const page = {
                    username: user.username
                }
                res.render('admin_home', {page: page})
            } catch (error) {
                console.log(error);
                req.session.destroy();
                res.redirect('/');
            }
        } else {
            res.redirect('/');
        };
    };

    const manageUsers = async (req, res) => {
        const user = req.session.class;

        if (user == undefined) {
            res.redirect('/');
            return
        } else {
            addClassMethods(user);
        };

        if (user.token != undefined && user.activeAccount && user.loggedIn && user.userLevel == 'admin') {
            try {
                const result = await database.handleGetAllUsers(user.username); // Put id here to ignore user.

                if (result.error) {
                    const page = { error: result.error };
                    res.render('manage_users', {page: page});
                    return;
                };

                const page = {
                    username: user.username,
                    users: result.users
                };

                res.render('manage_users', { page: page });

            } catch (error) {
                console.log(error);
                req.session.destroy();
                res.redirect('/');
            }
        } else {
            res.redirect('/');
        };
    };

    const activateAccountSubmit = async (req, res) => {

    };

    const makeAccountAdminSubmit = async (req, res) => {

    };

    return {
        logInPage,
        resetPasswordForm,
        createUserForm,
        resetPassword,
        createUser,
        signIn,
        displayUserHome,
        logOut,
        validateNinoForm,
        validateNino,
        checkSecurityQuestions,
        processCustomer,
        viewCustomerData,
        submitApplication,
        addCustomerForm,
        addCustomerSecurityForm,
        addCustomerSubmit,
        adminHome,
        manageUsers,
        activateAccountSubmit,
        makeAccountAdminSubmit
    };
};

module.exports = handler();

// TODO: Bundle view logic into separate file that takes in req and res parameters accordingly to neaten up this file.
