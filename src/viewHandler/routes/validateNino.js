const wrapper = controller => {
    return validateNino = async (req, res) => {
            const user = req.session.class;
            // If there is no user in the session, go back to log in.
            if (user == undefined) {
                res.redirect('/');
                return;
            } else {
                controller.addClassMethods(user);
            };

            if (user.token != undefined && user.activeAccount && user.loggedIn) {
                try {
                    const result = await controller.database.handleCheckToken(user.token, user.username);
                    if (!result.error) {
                        const response = await controller.database.handleValidateNino(req.body.nino.toUpperCase());


                        const page = {
                            nino: req.body.nino.toUpperCase(),
                            route: req.params.route,
                            error: response.error,
                            username: user.username
                        };

                        const customer = await controller.database.handleGetCustomer(page.nino);

                        if (customer.error) {
                            page.error = customer.error;
                            console.log('There was an error getting the customer information');
                            res.render('validate_nino', { page: page });
                            return;
                        }

                        page.customerName = customer.name;
                        page.customerSurname = customer.surname;
                        page.dob = customer.dob;

                        if (page.error) {
                            res.render('validate_nino', { page: page });
                        } else {
                            const result = await controller.database.handleGetSecurityQuestions(req.body.nino.toUpperCase());
                            // finally trust for the nino to be set in user class

                            user.setCustomerNino(req.body.nino.toUpperCase());
                            page.questions = result.questions;
                            res.render('security_questions', { page: page });
                        }
                    };

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
