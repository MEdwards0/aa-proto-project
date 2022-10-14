const wrapper = controller => {
    return viewCustomerData = async (req, res) => {
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

                    // Immediately quit if no access token.
                    if (security.error) {
                        res.redirect('/');
                        return;
                    };

                    // check token validity
                    const result = await controller.database.handleCheckToken(user.token, user.username);
                    result.error ? page.error = true : page.error = page.error;

                    // check nino validity
                    const nino = await controller.database.handleValidateNino(user.customerNino);
                    nino.error ? page.error = true : page.error = page.error;

                    // check nobody fiddled with the cookies
                    user.customerNino == req.params.nino ? page.error = page.error : page.error = true;

                    const customer = await controller.database.handleGetCustomer(page.nino);

                    if (customer.error) {
                        console.log('There was an error getting the customer information');
                        page.error = customer.error;
                    };

                    page.customerName = customer.name;
                    page.customerSurname = customer.surname;
                    page.dob = customer.dob;
                    page.dod = customer.dod;
                    page.claimDateStart = customer.claimDateStart;
                    page.claimDateEnd = customer.claimDateEnd;
                    page.awardRate = customer.awardRate;
                    page.claimedAA = customer.claimedAA;
                    page.rateCode = customer.rateCode

                    if (page.error) {
                        res.redirect('/');
                    } else {
                        res.render('view_customer_data', { page: page });
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
