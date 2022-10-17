const wrapper = controller => {
    return manageUsers = async (req, res) => {
            const user = req.session.class;

            log(req).info({ "session_id": req.session.id, "message": 'go to /manage-users' });

            if (user == undefined) {
                log(req).info({ "session_id": req.session.id, "message": 'User undefined. Redirecting to /'});
                res.redirect('/');
                return
            } else {
                controller.addClassMethods(user);
            };

            if (user.token != undefined && user.activeAccount && user.loggedIn && user.userLevel == 'admin') {
                try {
                    const result = await controller.database.handleGetAllUsers(user.username); // Put username here to ignore user.

                    log(req).debug({"session_id": req.session.id, "result.error": result.error});

                    if (result.error) {

                        const page = {
                            error: result.error,
                            username: user.username
                        };

                        log(req).debug({
                            "session_id": req.session.id, "page_variables": {
                                ...page
                            }
                        });

                        log(req).info({ "session_id": req.session.id, "message": 'Rendering manage_users' });

                        res.render('manage_users', { page: page });
                        return;
                    };

                    const page = {
                        username: user.username,
                        users: result.users
                    };

                    log(req).debug({
                        "session_id": req.session.id, "page_variables": {
                            ...page
                        }
                    });

                    log(req).info({ "session_id": req.session.id, "message": 'Rendering manage_users' });

                    res.render('manage_users', { page: page });

                } catch (error) {
                    log(req).debug({"session_id": req.session.id, "message": `manageUsers.js error: ${error}`});
                    req.session.destroy();
                    log(req).info({ "session_id": req.session.id, "message": 'Caught error. Redirecting to /' });
                    res.redirect('/');
                }
            } else {
                log(req).debug({"session_id": req.session.id, "permissions": {
                    "user.token": user.token,
                    "user.activeAccount": user.activeAccount,
                    "user.loggedIn": user.loggedIn,
                    "user.userLevel": user.userLevel
                }});

                log(req).info({ "session_id": req.session.id, "message": 'Permission to view page rejected. Redirecting to /'});
                res.redirect('/');
            };
        };
};

module.exports = wrapper;
