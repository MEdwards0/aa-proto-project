const { log } = require("../../logging");

const wrapper = controller => {
    return logOut = async (req, res) => {
        log(req).info({ "session_id": req.session.id, "message": 'Logging out' });

            try {
                const user = req.session.class;

                if (user == undefined) {
                    log(req).info({ "session_id": req.session.id, "message": 'User undefined. Redirecting to /' });
                    req.session.destroy();
                    res.redirect('/');
                    return;
                } else {
                    controller.addClassMethods(user);
                }

                await controller.database.handleRemoveToken(user.token);
                user.removeCustomerInfo();
                user.clearToken();
                user.logOut();

                req.session.destroy(); // destroy the current session.
                log(req).info({ "session_id": req.session.id, "message": 'Successfully logged out. Redirecting to /' });
                res.redirect('/');

            } catch (error) {
                log(req).debug({ "session_id": req.session.id, "error": `logOut.js error: ${error}`});
                req.session.destroy();
                log(req).info({ "session_id": req.session.id, "message": "Caught error. Redirecting to /" });
                res.redirect('/');
            };

        };
};

module.exports = wrapper;
