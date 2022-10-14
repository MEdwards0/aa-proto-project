const wrapper = (controller, User, Admin) => {
    return signIn = async (req, res) => {
            let user; // set to contain user class
            const { username, password } = req.body;
            const result = await controller.database.handleLogIn(username.toUpperCase(), password);

            // Check the user account level if there is one to be found:
            if (!result.error) {

                // assign the user the correct class depending on admin level.

                if (result.profile.admin) {
                    req.session.class = req.session.id = new Admin(username.toUpperCase(), result.profile.accountActive);
                    user = req.session.class; // set the user class here

                } else {
                    req.session.class = req.session.id = new User(username.toUpperCase(), result.profile.accountActive);
                    user = req.session.class; // set the user class here

                };

                user.setToken(result.token);
                user.logIn();

                if (user.activeAccount) {
                    res.redirect('user-home');
                } else {
                    const page = { error: true, activeAccount: user.activeAccount };
                    await controller.database.handleRemoveToken(user.token);
                    res.render('login', { page: page });
                };

            } else {
                const page = { error: result.error, activeAccount: true };
                res.render('login', { page: page });
            };
        };
};

module.exports = wrapper;
