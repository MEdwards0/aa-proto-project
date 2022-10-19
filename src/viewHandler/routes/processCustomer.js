const wrapper = (controller, log) => {
    return processCustomer = async (req, res) => {
        const session = {id: req.session.id}

        log(req).info({ "session_id": session.id, "message": `go to /process-customer/${req.params.nino}` });

        const user = req.session.class;

        if (user == undefined) {
            log(req).info({ "session_id": session.id, "message": 'User undefined. Redirecting to /' });
            res.redirect('/');
            return;
        } else {
            controller.addClassMethods(user);
        }

        if (user.token != undefined && user.activeAccount && user.loggedIn) {
            try {

                const page = {
                    nino: user.customerNino,
                    username: user.username,
                    error: false
                };

                log(req).debug({
                    "session_id": session.id, "key_variables": {
                        "nino": page.nino,
                        "error": page.error,
                        "username": page.username,
                    }
                });

                // check customer access token
                const security = await controller.database.handleCheckCustomerAccessToken(user.customerAccessToken, user.username, user.customerNino);
                security.error ? page.error = true : page.error = page.error;

                log(req).debug({ "session_id": session.id, "security.error": security.error, "page.error": page.error });

                // Immediately quit if no access token. Prevents Unnecessary further calls.
                if (security.error) {
                    log(req).info({ "session_id": session.id, "message": "Invalid customer access token. Redirecting to /" });
                    res.redirect('/');
                    return;
                };

                // check user token validity
                const result = await controller.database.handleCheckToken(user.token, user.username);
                result.error ? page.error = true : page.error = page.error;

                log(req).debug({ "session_id": session.id, "result.error": result.error, "page.error": page.error });

                // check nino validity
                const nino = await controller.database.handleValidateNino(user.customerNino);
                nino.error ? page.error = true : page.error = page.error;

                log(req).debug({ "session_id": session.id, "nino.error": nino.error, "page.error": page.error });

                // check nobody fiddled with the cookies
                user.customerNino == req.params.nino ? page.error = page.error : page.error = true;

                log(req).debug({ "session_id": session.id, "user.customerNino": user.customerNino, "req.params.nino": req.params.nino, "page.error": page.error });

                // get customer information for the page rendering here:

                const customer = await controller.database.handleGetCustomer(page.nino);

                log(req).debug({ "session_id": session.id, "customer.error": customer.error });

                if (customer.error) {
                    log(req).debug({ "session_id": session.id, "message": `processCustomer.js error: There was an error getting the customer information` });
                    page.error = customer.error;
                };

                page.customerName = customer.name;
                page.customerSurname = customer.surname;
                page.dob = customer.dob;

                log(req).debug({
                    "session_id": session.id, "page variables": {
                        ...page
                    }
                });

                if (page.error) {
                    log(req).info({ "session_id": session.id, "message": 'There was an error. Redirecting to /' })
                    res.redirect('/');
                } else {
                    log(req).info({ "session_id": session.id, "message": 'Rendering new_claim' })
                    res.render('new_claim', { page: page });
                };

            } catch (error) {
                log(req).debug({ "session_id": session.id, "message": `processCustomer.js error: ${error}` });
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
        };
    };
};

module.exports = wrapper;
