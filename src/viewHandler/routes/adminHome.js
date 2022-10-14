const wrapper = controller => {
    return adminHome = (req, res) => {
            const user = req.session.class;

            if (user == undefined) {
                res.redirect('/');
                return
            } else {
                controller.addClassMethods(user);
            };

            if (user.token != undefined && user.activeAccount && user.loggedIn && user.userLevel == 'admin') {
                try {
                    const page = {
                        username: user.username
                    }
                    res.render('admin_home', { page: page })
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
