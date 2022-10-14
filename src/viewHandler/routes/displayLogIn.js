const wrapper = controller => {
    return displayLogInPage = async (req, res) => {
            try {
                const user = req.session.class;

                if (user == undefined || user.token == undefined) {
                    const page = { error: true, activeAccount: true };
                    res.render('login', { error: page });

                } else {
                    controller.addClassMethods(user);
                    const result = await controller.database.handleCheckToken(user.token, user.username);
                    if (!result.status) {
                        req.session.destroy(); // destroy the current session.
                        const page = { error: true }
                        res.render('login', { error: page });
                    } else {
                        res.redirect('/user-home');
                    };
                };
            } catch (error) {
                console.log(error);
                const page = { error: false }
                res.render('login', { error: page });
            };
        };
};

module.exports = wrapper;
