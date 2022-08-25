const database = require('../database');
const claim = require('../claim');

const handler = () => {

    const displayUserHome = async (req, res) => {

        try {

            if (req.cookies.token != undefined) {

                res.clearCookie('nino');
                res.clearCookie('answerOne');
                res.clearCookie('answerTwo');
                res.clearCookie('answerThree');
                res.clearCookie('customerAccessToken');

                const profile = {
                    username: req.cookies.username,
                    id: req.cookies.id
                };

                const result = await database.handleGetToken(req.cookies.token, req.cookies.username);

                result.status ? res.render('user_home', { profile: profile }) : res.redirect('/log-out');
            } else {
                res.redirect('/');
            };

        } catch (error) {
            console.log(error);
            res.clearCookie('token');
            res.clearCookie('username');
            res.clearCookie('customerAccessToken');
            // res.clearCookie('id');
            res.redirect('/');
        };
    };

    const logInPage = async (req, res) => {
        try {
            const result = await database.handleGetToken(req.cookies.token, req.cookies.username);

            if (result.status) {
                res.redirect('/user-home');
            } else {
                res.clearCookie('token');
                res.clearCookie('username');
                res.clearCookie('nino');
                res.clearCookie('answerOne');
                res.clearCookie('answerTwo');
                res.clearCookie('answerThree');
                res.clearCookie('customerAccessToken');
            };

            if (req.cookies.token == undefined || !result.status) {
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
            res.cookie('token', result.token);
            res.cookie('username', result.profile.username);
            res.redirect('user-home');
        } else {
            res.render('login', { error: result.error });
        }
    };

    const logOut = async (req, res) => {
        try {
            await database.handleRemoveToken(req.cookies.token);
            res.clearCookie('token');
            res.clearCookie('username');
            res.clearCookie('nino');
            res.clearCookie('answerOne');
            res.clearCookie('answerTwo');
            res.clearCookie('answerThree');
            res.clearCookie('customerAccessToken');
            res.redirect('/');
        } catch (error) {
            console.log('error');
            res.redirect('/');
        };

    };

    const validateNinoForm = async (req, res) => {
        if (req.cookies.token != undefined) {
            try {
                const result = await database.handleGetToken(req.cookies.token, req.cookies.username);

                const page = {
                    route: req.params.route,
                    error: false,
                    username: req.cookies.username
                };

                result.status ? res.render('validate_nino', { page: page }) : res.redirect('/log-out');

            } catch (error) {
                console.log(error);
                res.clearCookie('token');
                res.clearCookie('username');
                res.clearCookie('answerOne');
                res.clearCookie('answerTwo');
                res.clearCookie('answerThree');
                res.redirect('/');
            };
        } else {
            res.redirect('/');
        }
    };

    const validateNino = async (req, res) => {

        if (req.cookies.token != undefined) {
            try {
                const result = await database.handleGetToken(req.cookies.token, req.cookies.username);

                if (!result.error) {
                    const response = await database.handleValidateNino(req.body.nino);


                    const page = {
                        nino: req.body.nino,
                        route: req.params.route,
                        error: response.error,
                        username: req.cookies.username
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
                        res.cookie('nino', req.body.nino);
                        page.questions = result.questions;
                        res.render('security_questions', { page: page });
                    }
                };

            } catch (error) {
                console.log(error);
                res.clearCookie('token');
                res.clearCookie('username');
                res.clearCookie('answerOne');
                res.clearCookie('answerTwo');
                res.clearCookie('answerThree');
                res.redirect('/');
            };
        } else {
            res.redirect('/');
        }
    };

    const checkSecurityQuestions = async (req, res) => {
        if (req.cookies.token != undefined) {
            try {
                const token = await database.handleGetToken(req.cookies.token, req.cookies.username);

                page = {
                    nino: req.cookies.nino,
                    route: req.params.route,
                    error: token.error,
                    username: req.cookies.username
                }

                if (!token.error) {

                    const result = await database.handleCheckSecurityAnswers(req.cookies.nino, req.body.answerOne, req.body.answerTwo, req.body.answerThree);

                    page.error = result.error

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
                        // res.clearCookie('nino');

                        // res.cookie('answerOne', req.body.answerOne);
                        // res.cookie('answerTwo', req.body.answerTwo);
                        // res.cookie('answerThree', req.body.answerThree);

                        // Issue new access token for customer information here.
                        const token = await database.handleAddNewCustomerAccessToken(req.cookies.username, req.cookies.nino);
                        res.cookie('customerAccessToken', token);

                        res.redirect(`/view-customer-data/${page.nino}`);
                    };
                }
            } catch (error) {
                console.log(error);
                res.clearCookie('token');
                res.clearCookie('username');
                res.clearCookie('nino');
                // res.clearCookie('answerOne');
                // res.clearCookie('answerTwo');
                // res.clearCookie('answerThree');
                res.redirect('/');
            }
        } else {
            res.redirect('/');
        }
    };

    const processCustomer = async (req, res) => {
        if (req.cookies.token != undefined) {
            try {

                const page = {
                    nino: req.cookies.nino,
                    username: req.cookies.username,
                    error: false
                }
                
                // check token validity
                const result = await database.handleGetToken(req.cookies.token, req.cookies.username);
                // console.log(`GATE: getToken. Result is: ${result.error}. Should be false.`);
                result.error ? page.error = true : page.error = page.error;

                // check nino validity
                const nino = await database.handleValidateNino(req.cookies.nino);
                // console.log(`GATE: validateNino. Result is: ${nino.error}. Should be false.`);
                nino.error ? page.error = true : page.error = page.error;

                // check nobody fiddled with the cookies
                req.cookies.nino == req.params.nino ? page.error = page.error : page.error = true;
                // console.log(`GATE: check cookies nino against url nino. Result is: ${req.cookies.nino == req.params.nino}. Should be true.`);

                // check security questions
                // const security = await database.handleCheckSecurityAnswers(req.params.nino, req.cookies.answerOne, req.cookies.answerTwo, req.cookies.answerThree);
                const security = await database.handleCheckCustomerAccessToken(req.cookies.customerAccessToken, req.cookies.username, req.cookies.nino);
                // console.log(`GATE: checkSecurityAnswers. Result is: ${security.error}. Should be false.`);
                security.error ? page.error = true : page.error = page.error;

                // res.clearCookie('answerOne');
                // res.clearCookie('answerTwo');
                // res.clearCookie('answerThree');

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

                if(page.error) {
                    res.redirect('/');
                } else {
                    res.render('new_claim', { page: page });
                    // res.send('success: render process_customer page');
                };
            } catch (error) {
                console.log(error);
                res.clearCookie('token');
                res.clearCookie('username');
                res.clearCookie('nino');
                res.clearCookie('customerAccessToken')
                // res.clearCookie('answerOne');
                // res.clearCookie('answerTwo');
                // res.clearCookie('answerThree');
                res.redirect('/');
            };
        } else {
            res.redirect('/');
        }
    };

    const viewCustomerData = async (req, res) => {
        if (req.cookies.token != undefined) {
            try {

                const page = {
                    nino: req.cookies.nino,
                    username: req.cookies.username,
                    error: false
                }

                // check token validity
                const result = await database.handleGetToken(req.cookies.token, req.cookies.username);
                // console.log(`GATE: getToken. Result is: ${result.error}. Should be false.`);
                result.error ? page.error = true : page.error = page.error;

                // check nino validity
                const nino = await database.handleValidateNino(req.cookies.nino);
                // console.log(`GATE: validateNino. Result is: ${nino.error}. Should be false.`);
                nino.error ? page.error = true : page.error = page.error;

                // check nobody fiddled with the cookies
                req.cookies.nino == req.params.nino ? page.error = page.error : page.error = true;
                // console.log(`GATE: check cookies nino against url nino. Result is: ${req.cookies.nino == req.params.nino}. Should be true.`);

                // check security questions
                // const security = await database.handleCheckSecurityAnswers(req.params.nino, req.cookies.answerOne, req.cookies.answerTwo, req.cookies.answerThree);
                const security = await database.handleCheckCustomerAccessToken(req.cookies.customerAccessToken, req.cookies.username, req.cookies.nino);
                // console.log(`GATE: checkCustomerAccessToken. Result is: ${security.error}. Should be false.`);
                security.error ? page.error = true : page.error = page.error;

                // res.clearCookie('answerOne');
                // res.clearCookie('answerTwo');
                // res.clearCookie('answerThree');

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
                    res.render('view_customer_data', {page: page});
                    // res.send('success: render view_customer_data page');
                };
            } catch (error) {
                console.log(error);
                res.clearCookie('token');
                res.clearCookie('username');
                res.clearCookie('nino');
                res.clearCookie('answerOne');
                res.clearCookie('answerTwo');
                res.clearCookie('answerThree');
                res.redirect('/');
            };
        } else {
            res.redirect('/');
        }
    };

    const submitApplication = async (req, res) => {
        if (req.cookies.token != undefined) {
            try {

                const page = {
                    nino: req.cookies.nino,
                    username: req.cookies.username,
                    claimMessage: 'none',
                    error: false
                }

                // check token validity
                const result = await database.handleGetToken(req.cookies.token, req.cookies.username);
                // console.log(`GATE: getToken. Result is: ${result.error}. Should be false.`);
                result.error ? page.error = true : page.error = page.error;

                // check nino validity
                const nino = await database.handleValidateNino(req.cookies.nino);
                // console.log(`GATE: validateNino. Result is: ${nino.error}. Should be false.`);
                nino.error ? page.error = true : page.error = page.error;

                // check nobody fiddled with the cookies
                req.cookies.nino == req.params.nino ? page.error = page.error : page.error = true;
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

                    res.render('failure_screen', {page: page});
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
                        res.render('failure_screen' , {page: page});
                    } else {
                        res.render('success_screen', {page: page});
                    };
                    
                };
            } catch (error) {
                console.log(error);
                res.clearCookie('token');
                res.clearCookie('username');
                res.clearCookie('nino');
                res.clearCookie('answerOne');
                res.clearCookie('answerTwo');
                res.clearCookie('answerThree');
                res.redirect('/');
            };
        } else {
            res.redirect('/');
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
        submitApplication
    };
};

module.exports = handler();

// TODO: Bundle view logic into separate file that takes in req and res parameters accordingly to neaten up this file.


