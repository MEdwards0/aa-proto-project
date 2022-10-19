const wrapper = (controller, log) => {
    return addCustomerForm = async (req, res) => {
        log(req).info({ "session_id": req.session.id, "message": 'Go to /add-customer' });

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

        log(req).debug({
            "session_id": req.session.id, "page variables": {
                ...page
            }
        });

        log(req).info({ "session_id": req.session.id, "message": 'Rendering new_customer' });

        res.render('new_customer', { page: page });
    };
};

module.exports = wrapper;
