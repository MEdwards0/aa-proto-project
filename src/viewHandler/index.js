const database = require('../database');

const handler = () => {

    const displayUserHome = async (req, res) => {

        try {

            if (req.cookies.token != undefined) {

                res.clearCookie('nino');

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
                res.clearCookie('nino')
            }

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

                    if (page.error) {
                        const questions = await database.handleGetSecurityQuestions(page.nino);
                        page.questions = questions.questions;

                        res.render('security_questions', { page: page });

                    } else {
                        // res.clearCookie('nino');
                        res.cookie('answerOne', req.body.answerOne);
                        res.cookie('answerTwo', req.body.answerTwo);
                        res.cookie('answerThree', req.body.answerThree);
                        res.redirect(`/${page.route}/${page.nino}`);
                    };
                }
            } catch (error) {
                console.log(error);
                res.clearCookie('token');
                res.clearCookie('username');
                res.clearCookie('nino');
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
                const security = await database.handleCheckSecurityAnswers(req.params.nino, req.cookies.answerOne, req.cookies.answerTwo, req.cookies.answerThree);
                // console.log(`GATE: checkSecurityAnswers. Result is: ${security.error}. Should be false.`);
                security.error ? page.error = true : page.error = page.error;

                res.clearCookie('answerOne');
                res.clearCookie('answerTwo');
                res.clearCookie('answerThree');

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
                const security = await database.handleCheckSecurityAnswers(req.params.nino, req.cookies.answerOne, req.cookies.answerTwo, req.cookies.answerThree);
                // console.log(`GATE: checkSecurityAnswers. Result is: ${security.error}. Should be false.`);
                security.error ? page.error = true : page.error = page.error;

                res.clearCookie('answerOne');
                res.clearCookie('answerTwo');
                res.clearCookie('answerThree');

                if (page.error) {
                    res.redirect('/');
                } else {
                    // res.render('process_customer', { page: page });
                    res.send('success: render view_customer_data page');
                };
            } catch (error) {
                console.log(error);
                res.clearCookie('token');
                res.clearCookie('username');
                res.clearCookie('nino');
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
        viewCustomerData
    };
};

module.exports = handler();

// TODO: Bundle view logic into separate file that takes in req and res parameters accordingly to neaten up this file.


