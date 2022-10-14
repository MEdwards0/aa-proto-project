const wrapper = controller => {
    return manageUsers = async (req, res) => {
            const user = req.session.class;

            if (user == undefined) {
                res.redirect('/');
                return
            } else {
                controller.addClassMethods(user);
            };

            if (user.token != undefined && user.activeAccount && user.loggedIn && user.userLevel == 'admin') {
                try {
                    const result = await controller.database.handleGetAllUsers(user.username); // Put username here to ignore user.

                    if (result.error) {
                        const page = {
                            error: result.error,
                            username: user.username
                        };
                        res.render('manage_users', { page: page });
                        return;
                    };

                    const page = {
                        username: user.username,
                        users: result.users
                    };

                    res.render('manage_users', { page: page });

                } catch (error) {
                    console.log(error);
                    req.session.destroy();
                    res.redirect('/');
                }
            } else {
                res.redirect('/');
            };
        };
};

module.exports = wrapper;
