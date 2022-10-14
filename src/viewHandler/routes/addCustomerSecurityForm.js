const wrapper = controller => {
    return addCustomerSecurityForm = async (req, res) => {

            const result = await controller.database.handleValidateNino(req.body.nino.toUpperCase());

            // Check the date input format

            req.body.dobYear.length != 4 ? result.message = 'Year format incorrect.' : result.message = result.message;

            req.body.dobMonth.length != 2 ? result.message = 'Month format incorrect.' : result.message = result.message;

            req.body.dobDay.length != 2 ? result.message = 'Day format incorrect.' : result.message = result.message;


            // Set the input date to the correct format.
            // Dates between client and server can vary. This implementation seems to work correctly now.

            const dob = new Date(Date.parse(`${req.body.dobYear}-${req.body.dobMonth}-${req.body.dobDay}`));
            // Check date inputs are not invalid

            const dateNow = new Date();

            if (dob.getTime() > dateNow.getTime()) {
                result.message = 'Date cannot be in the future.';
            }

            const page = {
                fName: req.body.fName.toUpperCase(),
                mName: req.body.mName.toUpperCase() || null,
                lName: req.body.lName.toUpperCase(),
                dob: dob,
                nino: req.body.nino.toUpperCase()
            };

            // Validate nino length

            if (page.nino.length != 9) {
                result.message = 'Invalid nino length.';
            }

            // Set session data here so it allows us to go back to this screen with the inputted data when an error occurs.

            req.session.nino = req.body.nino.toUpperCase();
            req.session.fName = page.fName;
            req.session.mName = page.mName
            req.session.lName = page.lName;
            req.session.dobYear = req.body.dobYear;
            req.session.dobMonth = req.body.dobMonth;
            req.session.dobDay = req.body.dobDay;

            // We want result.error to be true, so we know that there is not a nino in the db and no message so it wasnt because of another error.
            if (result.error && result.message == 'undefined') {

                req.session.dob = page.dob;

                res.render('new_customer_security', { page: page });

            } else {

                // If there is no session data, set it all to blank.

                const page = {
                    error: true,
                    errorMessage: result.message,
                    nino: req.session.nino || '',
                    fName: req.session.fName || '',
                    mName: req.session.mName || '',
                    lName: req.session.lName || '',
                    dobDay: req.session.dobDay || '',
                    dobMonth: req.session.dobMonth || '',
                    dobYear: req.session.dobYear || ''
                }

                res.render('new_customer', { page: page });
            };
        }
};

module.exports = wrapper;
