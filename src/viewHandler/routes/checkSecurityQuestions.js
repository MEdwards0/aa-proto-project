const wrapper = controller => {
    return checkSecurityQuestions = async (req, res) => {
            const user = req.session.class;

            if (user == undefined) {
                res.redirect('/');
                return;
            } else {
                controller.addClassMethods(user);
            };

            if (user.token != undefined && user.activeAccount && user.loggedIn) {
                try {
                    const token = await controller.database.handleCheckToken(user.token, user.username);

                    page = {
                        nino: user.customerNino,
                        route: req.params.route,
                        error: token.error,
                        username: user.username
                    }

                    if (!token.error) {

                        const result = await controller.database.handleCheckSecurityAnswers(user.customerNino, req.body.answerOne.toUpperCase(), req.body.answerTwo.toUpperCase(), req.body.answerThree.toUpperCase());

                        page.error = result.error;

                        const customer = await controller.database.handleGetCustomer(page.nino);

                        if (customer.error) {
                            page.error = customer.error;
                            console.log('There was an error getting the customer information');
                        }

                        page.customerName = customer.name;
                        page.customerSurname = customer.surname;
                        page.dob = customer.dob;

                        if (page.error) {
                            const questions = await controller.database.handleGetSecurityQuestions(page.nino);
                            page.questions = questions.questions;

                            res.render('security_questions', { page: page });

                        } else {

                            // Issue new access token for customer information here.
                            const token = await controller.database.handleAddNewCustomerAccessToken(user.username, user.customerNino);
                            // Set the customer access token to the user class
                            user.setCustomerAccessToken(token)

                            res.redirect(`/view-customer-data/${page.nino}`);
                        };
                    }
                } catch (error) {
                    console.log(error);
                    req.session.destroy(); // destroy the current session.
                    res.redirect('/');
                }
            } else {
                res.redirect('/');
            }
        }
};

module.exports = wrapper;
