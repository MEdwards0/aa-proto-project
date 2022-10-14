const wrapper = controller => {
    return displayUserHome = async (req, res) => {

            const user = req.session.class;

            if (user == undefined) {
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

                    const result = await controller.database.handleCheckToken(user.token, user.username);

                    user.removeCustomerInfo(); // Remove any customer information stored in the user class.

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
