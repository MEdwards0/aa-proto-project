const { Client } = require('pg');
const config = require('../config');

// Initial connection to the database using default database

const setup = new Client({
    user: config.databaseUser,
    host: config.databaseHost,
    password: config.databasePass,
    port: config.databasePort
})

// User defined database connection

const client = new Client({
    user: config.databaseUser,
    host: config.databaseHost,
    password: config.databasePass,
    port: config.databasePort,
    database: config.database
});

// Function to get the names of all databases in the database using the default connection.

const getDatabaseNames = async () => {
    const result = await setup.query('SELECT datname FROM pg_database');
    return result.rows;
}

// sets up a new database.
const setupDatabase = async () => {

    await dbConnect(true);
    // Grab names of database and store in variable
    const databases = await getDatabaseNames();

    // set flag default to false

    let databaseExists = false;

    for (i = 0; i < databases.length; i++) {
        if (databases[i].datname == config.database) {

            // set flag to true if database exists
            databaseExists = true;
        };
    };

    // if database does not exist, create it
    if (!databaseExists) {
        console.log(`Creating a new database with ${config.database}`);
        await createDatabase();
    };

    // Disconnect from the database to allow a new connection
    await dbDisconnect(true);
};

async function createDatabase() {
    const query = `CREATE DATABASE "${config.database}"`;
    await setup.query(query);
};


async function dbConnect(init=false) {
    // connect to a database depending on init value

    if (init) {
        await setup.connect();

    } else {
        await client.connect();

        // Print to the console which database we are connected to and what port we are using.
        console.log(`Connected to ${client.database} on port ${client.port}`);  
    };
};

async function dbDisconnect(init=false) {
    // disconnect from a database depending on init value

    if (init) {
        await setup.end();

    } else {
        await client.end();

        // If we disconnect, print it to the console.
        console.log(`Ending connection to ${client.database}.`);
    }; 
};

const buildUserTable = async () => {
    // create a table to store user data
    const query = `CREATE TABLE IF NOT EXISTS public."user"
        (
            id SERIAL PRIMARY KEY,
            username character varying(50),
            password character varying(200),
            "accountActive" boolean NOT NULL DEFAULT false,
            CONSTRAINT user_username_key UNIQUE (username)
        )`;
    await client.query(query);
};

async function buildTokenTable() {
    // create a table to store auth tokens
    const query = `CREATE TABLE IF NOT EXISTS "token" (
        "id" SERIAL PRIMARY KEY,
        "token" VARCHAR(255) NOT NULL,
        "user_id" INTEGER NOT NULL,
        "user_name" VARCHAR(255) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "expires_at" TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '1 day'
        )`;

    await client.query(query);
};

async function buildSchemaTables() {
    // neatly create all the tables in the schema
    await buildUserTable();
    await buildAdminTable();
    await buildCustomerTable();
    await buildRateCodeTable();
    await buildSecurityQuestionsTable();
    await buildTokenTable();
    await buildCustomerAccessTokenTable();
};

const buildSecurityQuestionsTable = async () => {
    // create a table to store security questions and answers using NINO as PF KEY
    const query = `CREATE TABLE IF NOT EXISTS "customerSecurity"
(	
	"id" SERIAL PRIMARY KEY NOT NULL,
    "NINO" character varying(9) COLLATE pg_catalog."default" NOT NULL,
    "questionOne" character varying(100) COLLATE pg_catalog."default" NOT NULL,
    "answerOne" character varying(100) COLLATE pg_catalog."default" NOT NULL,
    "questionTwo" character varying(100) COLLATE pg_catalog."default" NOT NULL,
    "answerTwo" character varying(100) COLLATE pg_catalog."default" NOT NULL,
    "questionThree" character varying(100) COLLATE pg_catalog."default" NOT NULL,
    "answerThree" character varying(100) COLLATE pg_catalog."default" NOT NULL,
	CONSTRAINT fk_NINO FOREIGN KEY("NINO") REFERENCES customer("NINO")
);`;

    await client.query(query);
};

const buildAdminTable = async () => {
    // create a table to store admin data
    const query = `CREATE TABLE IF NOT EXISTS "admin"
        ( 
        	"id" SERIAL PRIMARY KEY NOT NULL,
            "user_id" INTEGER NOT NULL,
        	"isAdmin" BOOLEAN NOT NULL DEFAULT FALSE,
			CONSTRAINT fk_user_id FOREIGN KEY("user_id") REFERENCES "user"("id")
        )`;

    await client.query(query);
};

const buildCustomerTable = async () => {
    // create a table to store customer data
    const query = `CREATE TABLE IF NOT EXISTS "customer"
        (   
            "id" SERIAL PRIMARY KEY NOT NULL,
        	"NINO" VARCHAR(9) NOT NULL,
         	"fName" VARCHAR(15) NOT NULL,
        	"mName" VARCHAR(15),
        	"lName" VARCHAR(15) NOT NULL,
        	"deceased" BOOLEAN NOT NULL DEFAULT FALSE,
        	"claimDateStart" DATE,
        	"claimDateEnd" DATE,
        	"rateCode" CHAR NOT NULL DEFAULT 'N',
        	"dob" DATE NOT NULL,
        	"dod" DATE,
        	"claimedAA" BOOLEAN NOT NULL DEFAULT FALSE,
			CONSTRAINT NINO_UNIQUE UNIQUE ("NINO")
        );`;
    
        await client.query(query);
};

const buildRateCodeTable = async () => {
    // create a relational table of rateCodes for AA and populate them.
    const query = `CREATE TABLE IF NOT EXISTS "rateCode"
            (
            	"code" character(1) NOT NULL,
            	rate real,
            	CONSTRAINT ratecode_pkey PRIMARY KEY (code)
            );
            
            INSERT INTO "rateCode" (code, rate) VALUES ('H', 92.40);
            INSERT INTO "rateCode" (code, rate) VALUES ('L', 61.85);
            INSERT INTO "rateCode" (code, rate) VALUES ('N', 0.00);`;

    // first part of the query will run, but if the table is already populated, it will throw an error. Try catch handles this.
    try {
        await client.query(query);
    } catch (error) {
        // If error is not what we expect, we will log the error.
        if (!error.constraint == 'ratecode_pkey') {
            console.log(error);
        };
    }
    
    
};

const buildCustomerAccessTokenTable = async () => {
    // Create a customer information access table of tokens.
    const query = `CREATE TABLE IF NOT EXISTS "customerAccessToken"
        (
            "id" SERIAL PRIMARY KEY,
            "NINO" VARCHAR(9) NOT NULL,
            "user" VARCHAR(50) NOT NULL,
            "token" VARCHAR(50) NOT NULL,
            CONSTRAINT fk_NINO FOREIGN KEY("NINO") REFERENCES customer("NINO"),
            CONSTRAINT fk_user FOREIGN KEY("user") REFERENCES "user"("username"),
            CONSTRAINT customerAccessToken_token_key UNIQUE ("token")
        )`;
    
    await client.query(query);
};

module.exports = { client, setup, dbConnect, setupDatabase, buildSchemaTables };
