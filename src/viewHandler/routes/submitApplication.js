const { log } = require("../../logging");

const wrapper = (controller) => {
    return submitApplication = async (req, res) => {
        const user = req.session.class;

        const session = {id: req.session.id}

        log(req).info({"session_id": session.id, "message": `/process-customer/${req.params.nino}/submit-application`});

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
                    claimMessage: 'none',
                    error: false
                }

                log(req).debug({
                    "session_id": session.id, "page_variables": {
                        ...page
                    }
                });

                // check token validity
                const result = await controller.database.handleCheckToken(user.token, user.username);
                result.error ? page.error = true : page.error = page.error;

                log(req).debug({ "session_id": session.id, "result.error": result.error, "page.error": page.error });

                // check nino validity
                const nino = await controller.database.handleValidateNino(user.customerNino);
                nino.error ? page.error = true : page.error = page.error;

                log(req).debug({ "session_id": session.id, "nino.error": nino.error, "page.error": page.error });

                // check nobody fiddled with the cookies
                user.customerNino == req.params.nino ? page.error = page.error : page.error = true;

                // claim process logic here, returns an object with an error and a claim message, if application.error is true, there was an error.
                log(req).info({ "session_id": session.id, "message": "processing new claim." });
                const application = controller.claim.processClaim(req);

                if (application.error) {
                    page.error = true;
                    page.databaseError = false;
                };

                // Get response message to display to user
                page.claimMessage = application.message;

                log(req).debug({
                    "session_id": session.id, "page_variables": {
                        ...page
                    }
                });

                if (page.error) {
                    log(req).info({ "session_id": session.id, "message": 'Rendering failure_screen' });
                    res.render('failure_screen', { page: page });
                } else {

                    const newClaim = {
                        nino: page.nino,
                        awardRate: req.body.careLevelSubmit.toUpperCase()
                    };

                    // Update cutomer table with claim details.
                    log(req).info({ "session_id": session.id, "message": "updating new claim" });
                    const response = await controller.database.handleUpdateClaim(newClaim);

                    log(req).debug({ "session_id": session.id, "response.error": response.error });

                    if (response.error) {
                        log(req).debug({ "session_id": session.id, "response.errorMessage": response.errorMessage });
                        page.databaseError = response.error;
                        page.claimMessage = 'There was an error updating the database';

                        log(req).info({ "session_id": session.id, "message": 'Rendering failure_screen' });
                        res.render('failure_screen', { page: page });
                    } else {
                        log(req).info({ "session_id": session.id, "message": 'Rendering success_screen' });
                        res.render('success_screen', { page: page });
                    };

                };
            } catch (error) {
                log(req).debug({ "session_id": session.id, "message": `submitApplication.js error: ${error}` });
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
