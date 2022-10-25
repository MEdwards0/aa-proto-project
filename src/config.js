// this file sets variables to contain data from an .env file. If there is no data found there, set the variables to a default value.
// uses dotenv node module to carry over .env variables to use here.

require('dotenv').config();

const env = process.env;

const databaseHost = env.DB_HOST || 'localhost';
const databaseUser = env.DB_USER || 'username';
const databasePass = env.DB_PASS || 'password';
const databasePort = env.DB_PORT || 5432;
const database = env.DATABASE || 'postgres';
const defaultAccount = env.DEFAULT_ACCOUNT == 'true' ? true : false;
const appLevel = env.APP_LEVEL == 'PROD' ? 'PROD' : 'DEV';
const logLevel = appLevel == 'PROD' ? 'info' : 'trace';

console.log('App level is', appLevel);
console.log('Log level is', logLevel);

const port = env.PORT || 3000;

module.exports = {
    databaseHost,
    databaseUser,
    databasePass,
    databasePort,
    database,
    defaultAccount,
    port,
    logLevel
};
