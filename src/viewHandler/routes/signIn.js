const wrapper = (controller, log) => {
    return signIn = async (req, res) => {

        const session = { id: req.session.id }

        log(req).info({ "session_id": session.id, "message": "post to /user-home" });

        let user; // set to contain user class
        const { username, password } = req.body;
        const result = await controller.database.handleLogIn(username.toUpperCase(), password);

        log(req).debug({ "session_id": session.id, "result.error": result.error });

        // Check the user account level if there is one to be found:
        if (!result.error) {

            // assign the user the correct class depending on admin level.
            log(req).debug({ "session_id": session.id, "result.profile.admin": result.profile.admin });

            if (result.profile.admin) {
                req.session.class = req.session.id = new controller.Admin(username.toUpperCase(), result.profile.accountActive);
                user = req.session.class; // set the user class here

                log(req).debug({ "session_id": session.id, "class assignment": "Admin" });

            } else {
                req.session.class = req.session.id = new controller.User(username.toUpperCase(), result.profile.accountActive);
                user = req.session.class; // set the user class here

                log(req).debug({ "session_id": session.id, "class assignment": "User" });
            };

            if (user.activeAccount) {
                log(req).debug({ "session_id": session.id, "message": "Calling setToken." });

                user.setToken(result.token);

                log(req).debug({ "session_id": session.id, "message": "Calling logIn" });

                user.logIn();
                
                log(req).info({ "session_id": session.id, "message": "Redirecting to /user-home" });
                res.redirect('/user-home');
            } else {
                const page = { error: true, activeAccount: user.activeAccount };

                log(req).debug({
                    "session_id": session.id, "page variables": {
                        ...page
                    }
                });

                await controller.database.handleRemoveToken(user.token);

                log(req).info({ "session_id": session.id, "message": "Rendering login." });

                res.render('login', { page: page });
            };

        } else {
            const page = { error: result.error, activeAccount: true };

            log(req).debug({
                "session_id": session.id, "page variables": {
                    ...page
                }
            });

            log(req).info({ "session_id": session.id, "message": "Rendering login." });

            res.render('login', { page: page });
        };
    };
};

module.exports = wrapper;
