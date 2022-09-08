// This file handles the views for the application. it depends on database calls, claim functionality, and Claim functionality
const database = require('../database');
const claim = require('../claim');
const { User, Admin } = require("../classes");
const { addClassMethods } = require('../classes/methods');

// Wrap the whole file in a function to return functions defined within at the end.

const handler = () => {

    // Display user home, checking for correct credentials

    const displayUserHome = async (req, res) => {

        const user = req.session.class;

        if (user == undefined) {
            res.redirect('/');
            return;
        } else {
            addClassMethods(user);
        }

        try {
            if (user.token != undefined && user.activeAccount && user.loggedIn) {
                const profile = {
                    username: user.username,
                    userLevel: user.userLevel
                };

                const result = await database.handleGetToken(user.token, user.username);

                user.removeCustomerInfo(); // Remove any customer information stored in the user class.

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
                const page = { error: true, activeAccount: true };
                res.render('login', { error: page });

            } else {
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
        res.render('create_user', {error: false});
    };

    const createUser = async (req, res) => {
        const { username, password } = req.body;
        const result = await database.handleAddUser(username.toUpperCase(), password);

        if (result.status) {
            res.render('confirm_user_created');
        } else {
            res.render('create_user', { error: true });
        }
    };

    const signIn = async (req, res) => {
        let user; // set to contain user class
        const { username, password } = req.body;
        const result = await database.handleLogIn(username.toUpperCase(), password);

        // Check the user account level if there is one to be found:
        if (!result.error) {

            // assign the user the correct class depending on admin level.

            if (result.profile.admin) {
                req.session.class = req.session.id = new Admin(username.toUpperCase(), password, result.profile.accountActive);
                user = req.session.class; // set the user class here

            } else {
                req.session.class = req.session.id = new User(username.toUpperCase(), password, result.profile.accountActive);
                user = req.session.class; // set the user class here

            };

            user.setToken(result.token);
            user.logIn();

            if (user.activeAccount) {
                res.redirect('user-home');
            } else {
                const page = { error: true, activeAccount: user.activeAccount }
                res.render('login', { page: page })
            };

        } else {
            const page = { error: result.error, activeAccount: true };
            res.render('login', { page: page });
        };
    };

    const logOut = async (req, res) => {
        try {
            const user = req.session.class;

            if (user == undefined) {
                req.session.destroy();
                res.redirect('/');
                return;
            } else {
                addClassMethods(user);
            }

            await database.handleRemoveToken(user.token);
            user.removeCustomerInfo();
            user.clearToken();
            user.logOut();

            req.session.destroy(); // destroy the current session.
            res.redirect('/');

        } catch (error) {
            console.log(error);
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

        if (user.token != undefined && user.activeAccount && user.loggedIn) {
            try {
                const result = await database.handleGetToken(user.token, user.username);
                if (!result.error) {
                    const response = await database.handleValidateNino(req.body.nino.toUpperCase());


                    const page = {
                        nino: req.body.nino.toUpperCase(),
                        route: req.params.route,
                        error: response.error,
                        username: user.username
                    };

                    const customer = await database.handleGetCustomer(page.nino);

                    if (customer.error) {
                        page.error = customer.error;
                        console.log('There was an error getting the customer information');
                        res.render('validate_nino', { page: page });
                        return;
                    }

                    page.customerName = customer.name;
                    page.customerSurname = customer.surname;
                    page.dob = customer.dob;

                    if (page.error) {
                        res.render('validate_nino', { page: page });
                    } else {
                        const result = await database.handleGetSecurityQuestions(req.body.nino.toUpperCase());
                        // finally trust for the nino to be set in user class

                        user.setCustomerNino(req.body.nino.toUpperCase());
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

                    const result = await database.handleCheckSecurityAnswers(user.customerNino, req.body.answerOne.toUpperCase(), req.body.answerTwo.toUpperCase(), req.body.answerThree.toUpperCase());

                    page.error = result.error;

                    const customer = await database.handleGetCustomer(page.nino);

                    if (customer.error) {
                        page.error = customer.error;
                        console.log('There was an error getting the customer information');
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

        if (user.token != undefined && user.activeAccount && user.loggedIn) {
            try {

                const page = {
                    nino: user.customerNino,
                    username: user.username,
                    error: false
                };

                // check token validity
                const result = await database.handleGetToken(user.token, user.username);
                result.error ? page.error = true : page.error = page.error;

                // check nino validity
                const nino = await database.handleValidateNino(user.customerNino);
                nino.error ? page.error = true : page.error = page.error;

                // check nobody fiddled with the cookies
                user.customerNino == req.params.nino ? page.error = page.error : page.error = true;

                // check security questions
                const security = await database.handleCheckCustomerAccessToken(user.customerAccessToken, user.username, user.customerNino);
                security.error ? page.error = true : page.error = page.error;

                // get customer information for the page rendering here:

                const customer = await database.handleGetCustomer(page.nino);

                if (customer.error) {
                    console.log('There was an error getting the customer information');
                    page.error = customer.error;
                };

                page.customerName = customer.name;
                page.customerSurname = customer.surname;
                page.dob = customer.dob;

                if (page.error) {
                    res.redirect('/');
                } else {
                    res.render('new_claim', { page: page });
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

        if (user.token != undefined && user.activeAccount && user.loggedIn) {
            try {

                const page = {
                    nino: user.customerNino,
                    username: user.username,
                    error: false
                }

                // check token validity
                const result = await database.handleGetToken(user.token, user.username);
                result.error ? page.error = true : page.error = page.error;

                // check nino validity
                const nino = await database.handleValidateNino(user.customerNino);
                nino.error ? page.error = true : page.error = page.error;

                // check nobody fiddled with the cookies
                user.customerNino == req.params.nino ? page.error = page.error : page.error = true;

                // check customer access token
                const security = await database.handleCheckCustomerAccessToken(user.customerAccessToken, user.username, user.customerNino);
                security.error ? page.error = true : page.error = page.error;

                const customer = await database.handleGetCustomer(page.nino);


                if (customer.error) {
                    console.log('There was an error getting the customer information');
                    page.error = customer.error;
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
                    res.render('view_customer_data', { page: page });
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
                result.error ? page.error = true : page.error = page.error;

                // check nino validity
                const nino = await database.handleValidateNino(user.customerNino);
                nino.error ? page.error = true : page.error = page.error;

                // check nobody fiddled with the cookies
                user.customerNino == req.params.nino ? page.error = page.error : page.error = true;

                // claim process logic here, returns an object with an error and a claim message, if application.error is true, there was an error.
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
                        awardRate: req.body.careLevelSubmit.toUpperCase()
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
            error: false,
            nino: req.session.nino || '',
            fName: req.session.fName || '',
            mName: req.session.mName || '',
            lName: req.session.lName || '',
            dobDay: req.session.dobDay || '',
            dobMonth: req.session.dobMonth || '',
            dobYear: req.session.dobYear || ''
        };

        res.render('new_customer', { page: page });
    };

    const addCustomerSecurityForm = async (req, res) => {

        const result = await database.handleValidateNino(req.body.nino.toUpperCase());

        // Check the date input format

        req.body.dobYear.length != 4 ? result.message = 'Year format incorrect.' : result.message = result.message;

        req.body.dobMonth.length != 2 ? result.message = 'Month format incorrect.' : result.message = result.message;

        req.body.dobDay.length != 2 ? result.message = 'Day format incorrect.' : result.message = result.message;

        
        // Set the input date to the correct format.
        // Dates between client and server can vary. This implementation seems to work correctly now.

        const dob = new Date(Date.parse(`${req.body.dobYear}-${req.body.dobMonth}-${req.body.dobDay}`));

        // Check date inputs are not invalid

        const dateNow = new Date();

        if (dob.getTime() > dateNow.getTime()) {
            result.message = 'Date cannot be in the future.';
        }

        const page = {
            fName: req.body.fName.toUpperCase(),
            mName: req.body.mName.toUpperCase() || null,
            lName: req.body.lName.toUpperCase(),
            dob: dob,
            nino: req.body.nino.toUpperCase()
        };

        // Validate nino length

        if (page.nino.length != 9) {
            result.message = 'Invalid nino length.';
        }

        // Set session data here so it allows us to go back to this screen with the inputted data when an error occurs.

        req.session.nino = req.body.nino.toUpperCase();
        req.session.fName = page.fName;
        req.session.mName = page.mName
        req.session.lName = page.lName;
        req.session.dobYear = req.body.dobYear;
        req.session.dobMonth = req.body.dobMonth;
        req.session.dobDay = req.body.dobDay;

        // We want result.error to be true, so we know that there is not a nino in the db and no message so it wasnt because of another error.
        if (result.error && result.message == 'undefined') {
    
            req.session.dob = page.dob;

            res.render('new_customer_security', { page: page });

        } else {

            // If there is no session data, set it all to blank.

            const page = {
                error: true,
                errorMessage: result.message,
                nino: req.session.nino || '',
                fName: req.session.fName || '',
                mName: req.session.mName || '',
                lName: req.session.lName || '',
                dobDay: req.session.dobDay || '',
                dobMonth: req.session.dobMonth || '',
                dobYear: req.session.dobYear || ''
            }

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
                answerOne: req.body.answerOne.toUpperCase(),
                answerTwo: req.body.answerTwo.toUpperCase(),
                answerThree: req.body.answerThree.toUpperCase()
            };

            const result = await database.handleAddNewCustomer(customer)

            if (!result.error) {
                req.session.destroy(); // reset session data
                res.render('confirm_user_created');
            } else {
                const page = {
                    errorMessage: result.errorMessage
                };

                res.render('add_customer_failure', {page: page})
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
                const result = await database.handleGetAllUsers(user.username); // Put username here to ignore user.

                if (result.error) {
                    const page = { 
                        error: result.error,
                        username: user.username
                    };
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
        const user = req.session.class;
        const {id, username} = req.body;

        if (user == undefined) {
            res.redirect('/');
            return
        } else {
            addClassMethods(user);
        };

        if (req.body.id == 'EMPTY' || req.body.id.trim() == '' || req.body.username == 'EMPTY' || req.body.username.trim() == '') {
            res.redirect('/manage-users');
            return;
        };

        if (!user.loggedIn || user.userLevel != 'admin') {
            // Stop the user pressing back on the browser to change a user without having the correct permissions.
            res.redirect('/');
            return;
        }

        await database.handleToggleAccountActive(id, username.toUpperCase());

        res.redirect('/manage-users');
    };

    const makeAccountAdminSubmit = async (req, res) => {
        const user = req.session.class;

        if (user == undefined) {
            res.redirect('/');
            return
        } else {
            addClassMethods(user);
        };

        if (req.body.id == 'EMPTY' || req.body.id.trim() == '') {
            res.redirect('/manage-users');
            return;
        };

        if (!user.loggedIn || user.userLevel != 'admin') {
            // Stop the user pressing back on the browser to change a user without having the correct permissions.
            res.redirect('/');
            return;
        };

        await database.handleToggleAdmin(req.body.id);

        res.redirect('/manage-users');
    };

    // Return all of the defined functions here.

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

// Export the return result of calling the handler function.

module.exports = handler();


