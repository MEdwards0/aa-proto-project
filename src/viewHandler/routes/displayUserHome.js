const { log } = require("../../logging");

const wrapper = controller => {
    return displayUserHome = async (req, res) => {
            log(req).info({"session_id": req.session.id, "message": 'Go to /user-home.'});
            const user = req.session.class;

            if (user == undefined) {
                log(req).info({ "session_id": req.session.id, "message": 'User undefined. Go to /.' });
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

                    result.status ? log(req).info({ "session_id": req.session.id, "message": 'Rendering user_home.' }) : log(req).info({ "session_id": req.session.id, "message": 'Token invalid. Go to /log-out.' });

                    result.status ? res.render('user_home', { profile: profile }) : res.redirect('/log-out');

                } else {
                    req.session.destroy();
                    res.redirect('/');
                };

            } catch (error) {
                console.log(error);
                req.session.destroy(); // destroy the current session.
                res.redirect('/');
            };
        };
};

module.exports = wrapper;
