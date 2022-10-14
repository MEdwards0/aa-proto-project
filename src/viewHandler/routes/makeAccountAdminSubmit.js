const wrapper = controller => {
    return makeAccountAdminSubmit = async (req, res) => {
            const user = req.session.class;

            if (user == undefined) {
                res.redirect('/');
                return
            } else {
                controller.addClassMethods(user);
            };

            if (req.body.id == 'EMPTY' || req.body.id.trim() == '') {
                res.redirect('/manage-users');
                return;
            };

            if (!user.loggedIn || user.userLevel != 'admin') {
                // Stop the user pressing back on the browser to change a user without having the correct permissions.
                res.redirect('/');
                return;
            };

            await controller.database.handleToggleAdmin(req.body.id);

            res.redirect('/manage-users');
        };
};

module.exports = wrapper;
