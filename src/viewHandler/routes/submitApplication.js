const wrapper = (controller) => {
    return submitApplication = async (req, res) => {
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
                        claimMessage: 'none',
                        error: false
                    }

                    // check token validity
                    const result = await controller.database.handleCheckToken(user.token, user.username);
                    result.error ? page.error = true : page.error = page.error;

                    // check nino validity
                    const nino = await controller.database.handleValidateNino(user.customerNino);
                    nino.error ? page.error = true : page.error = page.error;

                    // check nobody fiddled with the cookies
                    user.customerNino == req.params.nino ? page.error = page.error : page.error = true;

                    // claim process logic here, returns an object with an error and a claim message, if application.error is true, there was an error.
                    const application = controller.claim.processClaim(req);

                    if (application.error) {
                        page.error = true;
                        page.databaseError = false;
                    };

                    // Get response message to display to user
                    page.claimMessage = application.message;

                    if (page.error) {
                        res.render('failure_screen', { page: page });
                    } else {

                        const newClaim = {
                            nino: page.nino,
                            awardRate: req.body.careLevelSubmit.toUpperCase()
                        };

                        // Update cutomer table with claim details.
                        const response = await controller.database.handleUpdateClaim(newClaim);

                        if (response.error) {
                            console.log(response.errorMessage);
                            page.databaseError = response.error;
                            page.claimMessage = 'There was an error updating the database';

                            res.render('failure_screen', { page: page });
                        } else {
                            res.render('success_screen', { page: page });
                        };

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
