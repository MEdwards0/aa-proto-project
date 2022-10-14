const wrapper = (controller,) => {
    return activateAccountSubmit = async (req, res) => {
            const user = req.session.class;
            const { id, username } = req.body;

            if (user == undefined) {
                res.redirect('/');
                return
            } else {
                controller.addClassMethods(user);
            };

            if (req.body.id == 'EMPTY' || req.body.id.trim() == '' || req.body.username == 'EMPTY' || req.body.username.trim() == '') {
                res.redirect('/manage-users');
                return;
            };

            if (!user.loggedIn || user.userLevel != 'admin') {
                // Stop the user pressing back on the browser to change a user without having the correct permissions.
                res.redirect('/');
                return;
            }

            // add code here to delete any access tokens for the updated user.
            try {
                const result = await controller.database.handleAdminQueryToken(username);

                // if result error is false, request the removal of the token from the database.
                if (!result.error) {
                    await controller.database.handleRemoveToken(result.token);
                };

            } catch (error) {
                console.log(error);
            };

            // request the controller to toggle the account active status.
            await controller.database.handleToggleAccountActive(id, username.toUpperCase());

            res.redirect('/manage-users');
        };
};

module.exports = wrapper;
