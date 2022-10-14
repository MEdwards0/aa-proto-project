const wrapper = controller => {
    return processCustomer = async (req, res) => {
            const user = req.session.class;

            if (user == undefined) {
                res.redirect('/');
                return;
            } else {
                controller.addClassMethods(user);
            }

            if (user.token != undefined && user.activeAccount && user.loggedIn) {
                try {

                    const page = {
                        nino: user.customerNino,
                        username: user.username,
                        error: false
                    };

                    // check customer access token
                    const security = await controller.database.handleCheckCustomerAccessToken(user.customerAccessToken, user.username, user.customerNino);
                    security.error ? page.error = true : page.error = page.error;

                    // Immediately quit if no access token. Prevents Unnecessary further calls.
                    if (security.error) {
                        res.redirect('/');
                        return;
                    };

                    // check user token validity
                    const result = await controller.database.handleCheckToken(user.token, user.username);
                    result.error ? page.error = true : page.error = page.error;

                    // check nino validity
                    const nino = await controller.database.handleValidateNino(user.customerNino);
                    nino.error ? page.error = true : page.error = page.error;

                    // check nobody fiddled with the cookies
                    user.customerNino == req.params.nino ? page.error = page.error : page.error = true;

                    // get customer information for the page rendering here:

                    const customer = await controller.database.handleGetCustomer(page.nino);

                    if (customer.error) {
                        console.log('There was an error getting the customer information');
                        page.error = customer.error;
                    };

                    page.customerName = customer.name;
                    page.customerSurname = customer.surname;
                    page.dob = customer.dob;

                    if (page.error) {
                        res.redirect('/');
                    } else {
                        res.render('new_claim', { page: page });
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
