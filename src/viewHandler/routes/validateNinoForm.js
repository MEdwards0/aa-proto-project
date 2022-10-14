const wrapper = controller => {
    return validateNinoForm = async (req, res) => {
            const user = req.session.class;

            if (user == undefined) {
                res.redirect('/');
                return;
            } else {
                controller.addClassMethods(user);
            }

            if (user.token != undefined && user.activeAccount && user.loggedIn) {
                try {
                    const result = await controller.database.handleCheckToken(user.token, user.username);

                    const page = {
                        route: req.params.route,
                        error: false,
                        username: user.username
                    };

                    result.status ? res.render('validate_nino', { page: page }) : res.redirect('/log-out');

                } catch (error) {
                    console.log(error);
                    req.session.destroy(); // destroy the current session.
                    res.redirect('/');
                };
            } else {
                res.redirect('/');
            }
        };
};

module.exports = wrapper;
