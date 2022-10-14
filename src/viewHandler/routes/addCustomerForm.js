const wrapper = controller => {
    return addCustomerForm = async (req, res) => {
            const page = {
                error: false,
                nino: req.session.nino || '',
                fName: req.session.fName || '',
                mName: req.session.mName || '',
                lName: req.session.lName || '',
                dobDay: req.session.dobDay || '',
                dobMonth: req.session.dobMonth || '',
                dobYear: req.session.dobYear || ''
            };

            res.render('new_customer', { page: page });
        }
    ;
};

module.exports = wrapper;
