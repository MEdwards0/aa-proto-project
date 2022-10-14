const wrapper = controller => {
    return createUser = async (req, res) => {
            const { username, password } = req.body;
            const result = await controller.database.handleCreateUser(username.toUpperCase(), password);

            if (result.status) {
                res.render('confirm_user_created');
            } else {
                res.render('create_user', { error: true });
            };
        };
};

module.exports = wrapper;
