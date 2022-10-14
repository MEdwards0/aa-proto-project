const wrapper = controller => {
    return logOut = async (req, res) => {
            try {
                const user = req.session.class;

                if (user == undefined) {
                    req.session.destroy();
                    res.redirect('/');
                    return;
                } else {
                    controller.addClassMethods(user);
                }

                await controller.database.handleRemoveToken(user.token);
                user.removeCustomerInfo();
                user.clearToken();
                user.logOut();

                req.session.destroy(); // destroy the current session.
                res.redirect('/');

            } catch (error) {
                console.log(error);
                req.session.destroy();
                res.redirect('/');
            };

        };
};

module.exports = wrapper;
