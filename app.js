const express = require('express');
const nunjucks = require('nunjucks');
const path = require('path');
const bodyParser = require('body-parser');
const session =  require('express-session');
const { logger, log } = require('./src/logging');
const handler = require('./src/viewHandler');

const app = express();
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
}));

app.use(express.static(path.join('./src/public')));
app.use('controllers', express.static(path.join(__dirname, './controllers')));
app.use(logger.httpLogger);

// body-parser allow us to parse the body of the request.
app.use(bodyParser.urlencoded(({ extended: false })));
app.use(bodyParser.json());

app.set('views', './src/views');

app.set('view engine', 'njk');

nunjucks.configure(
    [
        "./node_modules/govuk-frontend",
        "./src/views",
    ],
    {
        autoescape: true,
        express: app,
    },
);

//  GETS

app.get('/', handler.displayLogInPage);

app.get('/create-user', (req, res) => {
    log(req).info({"session_id": req.session.id, "message": 'To create-user screen'});
    res.render('create_user', { error: false });
});

app.get('/forgot-password', (req, res) => {
    log(req).info({"session_id": req.session.id, "message": 'To forgot-password screen'});
    res.render('forgot_password');
});

app.get('/user-home', handler.displayUserHome);

app.get('/log-out', handler.logOut);

app.get('/validate-nino', handler.validateNinoForm);

app.get('/view-customer-data/:nino', handler.viewCustomerData);

app.get('/process-customer/:nino', handler.processCustomer);

app.get('/add-customer', handler.addCustomerForm);

// ADMIN ROUTES

app.get('/admin-home', handler.adminHome);

app.get('/manage-users', handler.manageUsers);

app.post('/activate-accounts-verify', handler.activateAccountSubmit);

app.post('/make-account-admin', handler.makeAccountAdminSubmit);

// DEV

// app.get('/clearSession', (req, res) => {
//     req.session.destroy();
//     res.send('session cleared');
// });

// POSTS

app.post('/user-home', handler.signIn);

app.post('/reset-password', (req, res) => {
    log(req).info({ "session_id": req.session.id, "message": 'Rendering confirm_password_reset' });
    res.render('confirm_password_reset');
});

app.post('/create-user', handler.createUser);

app.post('/validate-nino/security-questions', handler.validateNino);

app.post('/validate-nino/security-questions/:nino', handler.checkSecurityQuestions);

app.post('/process-customer/:nino/submit-application', handler.submitApplication);

app.post('/add-customer-security', handler.addCustomerSecurityForm);

app.post('/add-customer-submit', handler.addCustomerSubmit)

module.exports = app;
