const { log } = require("../../logging");

const wrapper = controller => {
    return makeAccountAdminSubmit = async (req, res) => {

        const session = {id: req.session.id}

        log(req).info({ "session_id": session.id, "message": "post to /activate-accounts-verify" });

        const user = req.session.class;

        if (user == undefined) {
            log(req).info({ "session_id": session.id, "message": 'User undefined. Redirecting to /' });
            res.redirect('/');
            return
        } else {
            controller.addClassMethods(user);
        };

        if (req.body.id == 'EMPTY' || req.body.id.trim() == '') {
            log(req).info({ "session_id": session.id, "message": 'User undefined. Redirecting to /manage-users' });
            res.redirect('/manage-users');
            return;
        };

        if (!user.loggedIn || user.userLevel != 'admin') {
            // Stop the user pressing back on the browser to change a user without having the correct permissions.
            log(req).debug({
                "session_id": session.id, "permissions": {
                    "user.loggedIn": user.loggedIn,
                    "user.userLevel": user.userLevel,
                }
            });

            log(req).info({ "session_id": session.id, "message": "Insufficient permissions. Redirecting to /" });
            res.redirect('/');
            return;
        };

        await controller.database.handleToggleAdmin(req.body.id);

        log(req).info({ "session_id": session.id, "message": "Redirecting to /manage-users" });

        res.redirect('/manage-users');
    };
};

module.exports = wrapper;
