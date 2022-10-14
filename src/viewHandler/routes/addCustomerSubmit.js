const wrapper = controller => {
    return addCustomerSubmit = async (req, res) => {
            const result = await controller.database.handleValidateNino(req.session.nino);

            // Any error will result in a true condition. If the db is broken for instance.
            if (result.error && result.message == 'undefined') {

                const customer = {
                    NINO: req.session.nino,
                    fName: req.session.fName,
                    mName: req.session.mName || null,
                    lName: req.session.lName,
                    dob: req.session.dob,
                    questionOne: req.body.questionOne,
                    questionTwo: req.body.questionTwo,
                    questionThree: req.body.questionThree,
                    answerOne: req.body.answerOne.toUpperCase(),
                    answerTwo: req.body.answerTwo.toUpperCase(),
                    answerThree: req.body.answerThree.toUpperCase()
                };

                const result = await controller.database.handleAddNewCustomer(customer)

                if (!result.error) {
                    req.session.destroy(); // reset session data
                    res.render('confirm_user_created');
                } else {
                    const page = {
                        errorMessage: result.errorMessage
                    };

                    res.render('add_customer_failure', { page: page })
                }
            }
        };
};

module.exports = wrapper;
