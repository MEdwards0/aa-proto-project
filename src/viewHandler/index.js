const database = require('../database');
const claim = require('../claim');
const {User, Admin} = require("../classes");

const handler = () => {

    const displayUserHome = async (req, res) => {
        try {

            if (req.session.token != undefined) {

                const profile = {
                    username: req.session.username,
                    id: req.session.id
                };

                const result = await database.handleGetToken(req.session.token, req.session.username);

                result.status ? res.render('user_home', { profile: profile }) : res.redirect('/log-out');
            } else {
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
            const result = await database.handleGetToken(req.session.token, req.session.username);

            console.log('DEBUG token is:', req.session.token);
            console.log('handleGetToken result: ', result.status)

            if (result.status) {
                res.redirect('/user-home');
            } else {
                req.session.destroy(); // destroy the current session.
            };

            if (req.session.token == undefined || !result.status) {
                res.render('login', { error: false });
            };

        } catch (error) {
            console.log(error);
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

        const { username, password } = req.body;
        const result = await database.handleLogIn(username, password);

        if (!result.error) {
            req.session.token = result.token;
            req.session.username = result.profile.username;
            res.redirect('user-home');
        } else {
            res.render('login', { error: result.error });
        }
    };

    const logOut = async (req, res) => {
        try {
            await database.handleRemoveToken(req.session.token);
            req.session.destroy(); // destroy the current session.
            res.redirect('/');
        } catch (error) {
            console.log('error');
            res.redirect('/');
        };

    };

    const validateNinoForm = async (req, res) => {
        if (req.session.token != undefined) {
            try {
                const result = await database.handleGetToken(req.session.token, req.session.username);

                const page = {
                    route: req.params.route,
                    error: false,
                    username: req.session.username
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

        if (req.session.token != undefined) {
            try {
                const result = await database.handleGetToken(req.session.token, req.session.username);

                if (!result.error) {
                    const response = await database.handleValidateNino(req.body.nino);


                    const page = {
                        nino: req.body.nino,
                        route: req.params.route,
                        error: response.error,
                        username: req.session.username
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
                        req.session.nino = req.body.nino
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
        if (req.session.token != undefined) {
            try {
                const token = await database.handleGetToken(req.session.token, req.session.username);

                page = {
                    nino: req.session.nino,
                    route: req.params.route,
                    error: token.error,
                    username: req.session.username
                }

                if (!token.error) {

                    console.log('DEBUG: checkSecurityAnswers', req.session.nino, req.body.answerOne, req.body.answerTwo, req.body.answerThree)

                    const result = await database.handleCheckSecurityAnswers(req.session.nino, req.body.answerOne, req.body.answerTwo, req.body.answerThree);

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
                        const token = await database.handleAddNewCustomerAccessToken(req.session.username, req.session.nino);
                        req.session.customerAccessToken = token;

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
        if (req.session.token != undefined) {
            try {

                const page = {
                    nino: req.session.nino,
                    username: req.session.username,
                    error: false
                }

                // check token validity
                const result = await database.handleGetToken(req.session.token, req.session.username);
                // console.log(`GATE: getToken. Result is: ${result.error}. Should be false.`);
                result.error ? page.error = true : page.error = page.error;

                // check nino validity
                const nino = await database.handleValidateNino(req.session.nino);
                // console.log(`GATE: validateNino. Result is: ${nino.error}. Should be false.`);
                nino.error ? page.error = true : page.error = page.error;

                // check nobody fiddled with the cookies
                req.session.nino == req.params.nino ? page.error = page.error : page.error = true;
                // console.log(`GATE: check cookies nino against url nino. Result is: ${req.cookies.nino == req.params.nino}. Should be true.`);

                // check security questions
                const security = await database.handleCheckCustomerAccessToken(req.session.customerAccessToken, req.session.username, req.session.nino);
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
        if (req.session.token != undefined) {
            try {

                const page = {
                    nino: req.session.nino,
                    username: req.session.username,
                    error: false
                }

                // check token validity
                const result = await database.handleGetToken(req.session.token, req.session.username);
                // console.log(`GATE: getToken. Result is: ${result.error}. Should be false.`);
                result.error ? page.error = true : page.error = page.error;

                // check nino validity
                const nino = await database.handleValidateNino(req.session.nino);
                // console.log(`GATE: validateNino. Result is: ${nino.error}. Should be false.`);
                nino.error ? page.error = true : page.error = page.error;

                // check nobody fiddled with the cookies
                req.session.nino == req.params.nino ? page.error = page.error : page.error = true;
                // console.log(`GATE: check cookies nino against url nino. Result is: ${req.cookies.nino == req.params.nino}. Should be true.`);

                // check security questions
                const security = await database.handleCheckCustomerAccessToken(req.session.customerAccessToken, req.session.username, req.session.nino);
                // console.log(`GATE: checkCustomerAccessToken. Result is: ${security.error}. Should be false.`);
                security.error ? page.error = true : page.error = page.error;

                const customer = await database.handleGetCustomer(page.nino);

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
        if (req.session.token != undefined) {
            try {

                const page = {
                    nino: req.session.nino,
                    username: req.session.username,
                    claimMessage: 'none',
                    error: false
                }

                // check token validity
                const result = await database.handleGetToken(req.session.token, req.session.username);
                // console.log(`GATE: getToken. Result is: ${result.error}. Should be false.`);
                result.error ? page.error = true : page.error = page.error;

                // check nino validity
                const nino = await database.handleValidateNino(req.session.nino);
                // console.log(`GATE: validateNino. Result is: ${nino.error}. Should be false.`);
                nino.error ? page.error = true : page.error = page.error;

                // check nobody fiddled with the cookies
                req.session.nino == req.params.nino ? page.error = page.error : page.error = true;
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
        addCustomerSubmit
    };
};

module.exports = handler();

// TODO: Bundle view logic into separate file that takes in req and res parameters accordingly to neaten up this file.
