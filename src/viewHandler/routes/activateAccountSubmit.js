const { log } = require("../../logging");

const wrapper = (controller,) => {
    return activateAccountSubmit = async (req, res) => {
        const user = req.session.class;
        const { id, username } = req.body;
        const session = {id: req.session.id}

        log(req).info({ "session_id": session.id, "message": "post to /activate-accounts-verify" });

        log(req).debug({
            "session_id": session.id, "variables": {
                "id": id,
                "username": username
            }
        });

        if (user == undefined) {
            log(req).info({ "session_id": session.id, "message": 'User undefined. Redirecting to /' });
            res.redirect('/');
            return
        } else {
            controller.addClassMethods(user);
        };

        if (req.body.id == 'EMPTY' || req.body.id.trim() == '' || req.body.username == 'EMPTY' || req.body.username.trim() == '') {
            log(req).debug({
                "session_id": session.id, "variables": {
                    "id": req.body.id,
                    "username": req.body.username,
                }
            });

            log(req).info({ "session_id": session.id, "message": "No data selected. Redirecting to /manage-users" });
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
        }

        // add code here to delete any access tokens for the updated user.
        try {
            const result = await controller.database.handleAdminQueryToken(username);

            log(req).debug({ "session_id": session.id, "result.error": result.error });

            // if result.error is false, request the removal of the token from the database.
            if (!result.error) {
                await controller.database.handleRemoveToken(result.token);
            };

        } catch (error) {
            log(req).debug({ "session_id": session.id, "message": `activateAccountSubmit.js error: ${error}` });
        };

        // request the controller to toggle the account active status.
        await controller.database.handleToggleAccountActive(id, username.toUpperCase());

        log(req).info({ "session_id": session.id, "message": "Redirecting to /manage-users" });
        res.redirect('/manage-users');
    };
};

module.exports = wrapper;
