const { log } = require("../../logging");

const wrapper = controller => {
    return validateNinoForm = async (req, res) => {
        log(req).info({ "session_id": req.session.id, "message": 'go to /validate-nino.' });

            const user = req.session.class;

            if (user == undefined) {
                log(req).info({ "session_id": req.session.id, "message": 'User undefined. Redirecting to /'});
                res.redirect('/');
                return;
            } else {
                controller.addClassMethods(user);
            }

            if (user.token != undefined && user.activeAccount && user.loggedIn) {
                try {
                    const result = await controller.database.handleCheckToken(user.token, user.username);

                    const page = {
                        route: req.params.route,
                        error: false,
                        username: user.username
                    };

                    log(req).debug({
                        "session_id": req.session.id, "key_variables": {
                            "route": page.route,
                            "error": page.error,
                            "username": page.username,
                        }
                    });

                    result.status ? log(req).info({ "session_id": req.session.id, "message": 'Rendering validate_nino' }) : log(req).info({ "session_id": req.session.id, "message": 'Token invalid. Redirecting to /log-out' });

                    result.status ? res.render('validate_nino', { page: page }) : res.redirect('/log-out');

                } catch (error) {
                    log(req).debug({ "session_id": req.session.id, "error": `validateNinoForm.js error: ${error}`});
                    req.session.destroy(); // destroy the current session.
                    log(req).info({ "session_id": req.session.id, "message": "Caught error. Redirecting to /" });
                    res.redirect('/');
                };
            } else {
                log(req).debug({"session_id": req.session.id, "permissions": {
                    "user.token": user.token,
                    "user.activeAccount": user.activeAccount,
                    "user.loggedIn": user.loggedIn,
                }});
                log(req).info({ "session_id": req.session.id, "message": 'Permission to view page rejected. Redirecting to /' })
                res.redirect('/');
            }
        };
};

module.exports = wrapper;
