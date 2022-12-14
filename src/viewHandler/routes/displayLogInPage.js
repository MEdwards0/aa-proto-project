const wrapper = (controller, log) => {
    return displayLogInPage = async (req, res) => {
        const session = {id: req.session.id};

        try {
            const user = req.session.class;
            

            log(req).info({ "session_id": session.id, "message": 'Go to /' });

            if (user == undefined || user.token == undefined) {

                const page = { error: false, activeAccount: false };

                log(req).debug({
                    "session_id": session.id, "key_variables": {
                        "page.error": page.error,
                        "activeAccount": page.activeAccount
                    }
                });

                log(req).info({"session_id": session.id, "message": "Rendering Log in screen"});

                res.render('login', { page: page });

            } else {
                controller.addClassMethods(user);
                const result = await controller.database.handleCheckToken(user.token, user.username);

                log(req).debug({
                    "session_id": session.id, "key_variables": {
                        "username": user.username,
                        "token": user.token,
                        "result.status": result.status
                    }
                });

                if (!result.status) {
                    log(req).info({"session_id": session.id, "message": "Invalid token. Rendering Log in screen"});
                    req.session.destroy(); // destroy the current session.
                    const page = { error: false }; // Don't show error as the token is invalid, meaning expired or manually deleted. Show fresh log in page.
                    log(req).debug({
                        "session_id": session.id, "key_variables": {
                            "result.status": result.status
                        }
                    });
                    res.render('login', { page: page });
                } else {
                    log(req).info({ "session_id": session.id, "message": 'Already logged in. Redirecting to /user-home' });
                    res.redirect('/user-home');
                };
            };
        } catch (error) {
            log(req).debug({"session_id": session.id, "error": `displayLogInPage.js error: ${error}`});
            // console.log(error);
            const page = { error: false, activeAccount: false };
            log(req).info({"session_id": session.id, "message": "Caught error. Rendering Log in screen"});
            res.render('login', { page: page });
        };
    };
};

module.exports = wrapper;
