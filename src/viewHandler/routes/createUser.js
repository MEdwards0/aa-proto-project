const { log } = require("../../logging");

const wrapper = controller => {
    return createUser = async (req, res) => {
        const { username, password } = req.body;
        const session = {id: req.session.id}

        const result = await controller.database.handleCreateUser(username.toUpperCase(), password);

        log(req).debug({"session_id": session.id, "result.status": result.status});

        if (result.status) {
            log(req).info({"session_id": session.id, "message": "Rendering confirm_user_created"});
            res.render('confirm_user_created');
        } else {
            log(req).info({"session_id": session.id, "message": "Rendering create_user"});
            res.render('create_user', { error: true });
        };
    };
};

module.exports = wrapper;
