const express = require('express');
const nunjucks = require('nunjucks');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session =  require('express-session');
require('dotenv').config();


const app = express();
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
}))
const handler = require('./viewHandler');

app.use(express.static(path.join('./public')));
app.use('controllers', express.static(path.join(__dirname, './controllers')));
app.use(cookieParser());


// body-parser allow us to parse the body of the request.
app.use(bodyParser.urlencoded(({ extended: false })));
app.use(bodyParser.json());

app.set('views', '../src/views');

app.set('view engine', 'njk');

nunjucks.configure(
    [
        "../node_modules/govuk-frontend",
        "../src/views",
    ],
    {
        autoescape: true,
        express: app,
    },
);

// Misc Middleware


// const { addClassMethods } = require('./classes/methods');// require('../classes/methods');

// app.use((req, res, next) => {
//     addClassMethods(req.session.class);
//     next()
// })

//  GETS

app.get('/', handler.logInPage);

app.get('/create-user', handler.createUserForm);

app.get('/forgot-password', handler.resetPasswordForm);

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

app.get('/clearCookies', (req, res) => {
    res.clearCookie('token');
    res.clearCookie('username');
    res.clearCookie('id');
    res.clearCookie('nino');
    res.send('cookies cleared');
});

// POSTS

app.post('/user-home', handler.signIn);

app.post('/reset-password', handler.resetPassword);

app.post('/create-user', handler.createUser);

app.post('/validate-nino/security-questions', handler.validateNino);

app.post('/validate-nino/security-questions/:nino', handler.checkSecurityQuestions);

app.post('/process-customer/:nino/submit-application', handler.submitApplication);

app.post('/add-customer-security', handler.addCustomerSecurityForm);

app.post('/add-customer-submit', handler.addCustomerSubmit)

module.exports = app;


