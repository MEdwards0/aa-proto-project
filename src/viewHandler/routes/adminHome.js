const wrapper = (controller, log) => {
    return adminHome = (req, res) => {
        const user = req.session.class;
        const session = {id: req.session.id}

        log(req).info({ "session_id": session.id, "message": 'Go to /admin-home' });

        if (user == undefined) {
            log(req).info({ "session_id": session.id, "message": 'User undefined. Redirecting to /' });
            res.redirect('/');
            return
        } else {
            controller.addClassMethods(user);
        };

        if (user.token != undefined && user.activeAccount && user.loggedIn && user.userLevel == 'admin') {
            try {
                const page = {
                    username: user.username
                };

                log(req).debug({
                    "session_id": session.id, "page_variables": {
                        ...page
                    }
                });

                log(req).info({ "session_id": session.id, "message": 'Rendering admin_home' });

                res.render('admin_home', { page: page })
            } catch (error) {
                log(req).debug({ "session_id": session.id, "message": `adminHome.js error: ${error}` });
                req.session.destroy();
                log(req).info({ "session_id": session.id, "message": 'Caught error. Redirecting to /' });
                res.redirect('/');
            }
        } else {
            log(req).debug({
                "session_id": session.id, "permissions": {
                    "user.token": user.token,
                    "user.activeAccount": user.activeAccount,
                    "user.loggedIn": user.loggedIn,
                    "user.userLevel": user.userLevel
                }
            });
            log(req).info({ "session_id": session.id, "message": 'Permission to view page rejected. Redirecting to /' });
            res.redirect('/');
        };
    };
};

module.exports = wrapper;
