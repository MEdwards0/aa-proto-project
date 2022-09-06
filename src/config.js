require('dotenv').config();

const env = process.env;

const databaseHost = env.DB_HOST || 'localhost';
const databaseUser = env.USER || 'postgres';
const databasePass = env.DB_PASS || 'password';
const databasePort = env.DB_PORT || 5432;
const database = env.DATABASE || 'postgres';

const port = env.PORT || 3000;

module.exports = {
    databaseHost,
    databaseUser,
    databasePass,
    databasePort,
    database,
    port
};
