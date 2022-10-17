const { log } = require("../../logging");

const wrapper = controller => {
    return checkSecurityQuestions = async (req, res) => {
        const user = req.session.class;
        const session = {id: req.session.id}

        log(req).info({"session_id": session.id, "message": `validate-nino/security-questions/${req.params.nino}`});

        if (user == undefined) {
            log(req).info({ "session_id": session.id, "message": 'User undefined. Redirecting to /' });
            res.redirect('/');
            return;
        } else {
            controller.addClassMethods(user);
        };

        if (user.token != undefined && user.activeAccount && user.loggedIn) {
            try {
                const token = await controller.database.handleCheckToken(user.token, user.username);

                const page = {
                    nino: user.customerNino,
                    route: req.params.route,
                    error: token.error,
                    username: user.username
                };

                log(req).debug({
                    "session_id": session.id, "page_variables": {
                        ...page
                    }
                });

                log(req).debug({ "session_id": session.id, "token.error": token.error });

                if (!token.error) {

                    const result = await controller.database.handleCheckSecurityAnswers(user.customerNino, req.body.answerOne.toUpperCase(), req.body.answerTwo.toUpperCase(), req.body.answerThree.toUpperCase());

                    page.error = result.error;

                    log(req).debug({ "session_id": session.id, "result.error": result.error, "page.error": page.error });

                    const customer = await controller.database.handleGetCustomer(page.nino);

                    log(req).debug({ "session_id": session.id, "customer.error": customer.error });

                    if (customer.error) {
                        page.error = customer.error;
                        log(req).debug({ "session_id": session.id, "message": 'There was an error getting the customer information'});
                    };

                    page.customerName = customer.name;
                    page.customerSurname = customer.surname;
                    page.dob = customer.dob;

                    log(req).debug({
                        "session_id": session.id, "page_variables": {
                            ...page
                        }
                    });

                    if (page.error) {
                        const questions = await controller.database.handleGetSecurityQuestions(page.nino);
                        page.questions = questions.questions;

                        log(req).info({ "session_id": session.id, "message": 'Rendering security_questions' });
                        res.render('security_questions', { page: page });

                    } else {

                        // Issue new access token for customer information here.
                        const token = await controller.database.handleAddNewCustomerAccessToken(user.username, user.customerNino);
                        // Set the customer access token to the user class
                        user.setCustomerAccessToken(token)

                        log(req).info({ "session_id": session.id, "message": `Redirecting to /view-customer-data/${page.nino}` });
                        res.redirect(`/view-customer-data/${page.nino}`);
                    };
                }
            } catch (error) {
                log(req).debug({ "session_id": session.id, "message": `checkSecurityQuestions.js error: ${error}` });
                req.session.destroy(); // destroy the current session.
                log(req).info({ "session_id": session.id, "message": 'Caught error. Redirecting to /' });
                res.redirect('/');
            }
        } else {

            log(req).debug({
                "session_id": session.id, "permissions": {
                    "user.token": user.token,
                    "user.activeAccount": user.activeAccount,
                    "user.loggedIn": user.loggedIn,
                }
            });
            
            log(req).info({ "session_id": session.id, "message": 'Permission to view page rejected. Redirecting to /' });
            res.redirect('/');
        };
    };
};

module.exports = wrapper;
