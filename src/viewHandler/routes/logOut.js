const { log } = require("../../logging");

const wrapper = controller => {
    return logOut = async (req, res) => {
        const session = {id: req.session.id}
        log(req).info({ "session_id": session.id, "message": 'Logging out' });

        try {
            const user = req.session.class;

            if (user == undefined) {
                log(req).info({ "session_id": session.id, "message": 'User undefined. Redirecting to /' });
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
            log(req).info({ "session_id": session.id, "message": 'Successfully logged out. Redirecting to /' });
            req.session.destroy(); // destroy the current session.
            
            res.redirect('/');

        } catch (error) {
            console.log(error)
            if (session.id == undefined) {
                log(req).info({ "session_id": session.id, "message": 'Successfully logged out. Redirecting to /' });
            }
            res.redirect('/');
        };

    };
};

module.exports = wrapper;
