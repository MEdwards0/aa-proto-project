const { log } = require("../../logging");

const wrapper = controller => {
    return displayUserHome = async (req, res) => {
            log(req).info({"session_id": req.session.id, "message": 'Go to /user-home'});
            const user = req.session.class;

            if (user == undefined) {
                log(req).info({ "session_id": req.session.id, "message": 'User undefined. Redirecting to /' });
                res.redirect('/');
                return;
            } else {
                controller.addClassMethods(user);
            }

            try {
                if (user.token != undefined && user.activeAccount && user.loggedIn) {
                    const profile = {
                        username: user.username,
                        userLevel: user.userLevel
                    };

                    log(req).debug({ "session_id": req.session.id, "key_variables": {
                        "userLevel": user.userLevel
                    } });

                    const result = await controller.database.handleCheckToken(user.token, user.username);

                    user.removeCustomerInfo(); // Remove any customer information stored in the user class.

                    result.status ? log(req).info({ "session_id": req.session.id, "message": 'Rendering user_home' }) : log(req).info({ "session_id": req.session.id, "message": 'Token invalid. Redirecting to /log-out.' });

                    result.status ? res.render('user_home', { profile: profile }) : res.redirect('/log-out');

                } else {
                    log(req).info({ "session_id": req.session.id, "message": 'Permission to view page rejected. Redirecting to /' })
                    req.session.destroy();
                    res.redirect('/');
                };

            } catch (error) {
                log(req).debug({ "session_id": req.session.id, "error": `displayUserHome.js error: ${error}` });
                // console.log(error);
                req.session.destroy(); // destroy the current session.
                log(req).info({"session_id": req.session.id, "message": "Caught error. Redirecting to Log in screen"});
                res.redirect('/');
            };
        };
};

module.exports = wrapper;
