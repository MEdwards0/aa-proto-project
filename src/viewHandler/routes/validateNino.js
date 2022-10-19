const wrapper = (controller, log) => {
    return validateNino = async (req, res) => {

        const user = req.session.class;
        const session = {id: req.session.id}

        log(req).info({"session_id": session.id, "message": 'post to /validate-nino/security-questions'});

        // If there is no user in the session, go back to log in.
        if (user == undefined) {
            log(req).info({ "session_id": session.id, "message": 'User undefined. Redirecting to /'});
            res.redirect('/');
            return;
        } else {
            controller.addClassMethods(user);
        };

        if (user.token != undefined && user.activeAccount && user.loggedIn) {
            try {
                const result = await controller.database.handleCheckToken(user.token, user.username);

                log(req).debug({ "session_id": session.id, "result.error": result.error});

                if (!result.error) {
                    const response = await controller.database.handleValidateNino(req.body.nino.toUpperCase());


                    const page = {
                        nino: req.body.nino.toUpperCase(),
                        route: req.params.route,
                        error: response.error,
                        username: user.username
                    };

                    const customer = await controller.database.handleGetCustomer(page.nino);

                    log(req).debug({ "session_id": session.id, "customer.error": customer.error });

                    if (customer.error) {
                        page.error = customer.error;
                        log(req).debug({ "session_id": session.id, "message": 'There was an error getting the customer information'});
                        // console.log('There was an error getting the customer information');
                        res.render('validate_nino', { page: page });
                        return;
                    }

                    page.customerName = customer.name;
                    page.customerSurname = customer.surname;
                    page.dob = customer.dob;

                    log(req).debug({
                        "session_id": session.id, "page_variables": {
                            ...page
                        }
                    });

                    if (page.error) {
                        log(req).info({ "session_id": session.id, "message": 'Rendering validate_nino' });
                        res.render('validate_nino', { page: page });
                    } else {
                        const result = await controller.database.handleGetSecurityQuestions(req.body.nino.toUpperCase());
                        // finally trust for the nino to be set in user class
                        log(req).debug({ "session_id": session.id, "result.questions": {...result.questions} });
                        user.setCustomerNino(req.body.nino.toUpperCase());
                        page.questions = result.questions;

                        log(req).info({ "session_id": session.id, "message": 'Rendering security_questions' });
                        res.render('security_questions', { page: page });
                    }
                };

            } catch (error) {
                log(req).debug({ "session_id": session.id, "message": `validateNino.js error: ${error}` });
                req.session.destroy(); // destroy the current session.
                log(req).info({ "session_id": session.id, "message": 'Caught error. Redirecting to /' });
                res.redirect('/');
            };
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
        }
    };
};

module.exports = wrapper;
