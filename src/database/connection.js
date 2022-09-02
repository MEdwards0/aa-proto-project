const { Client } = require('pg');

// Initial connection to the database using default database

const setup = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT
})

// User defined database connection

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    database: process.env.DATABASE
});

// Function to get the names of all databases in the database using the default connection

const getDatabaseNames = async () => {
    // Simple function to query the setup database for the database names
    const query = `SELECT datname FROM pg_database`;
    const result = await setup.query(query);
    return result.rows;
}

// sets up a new database and 
const setupDatabase = async () => {

    await dbConnect(true);
    // Grab names of database and store in variable
    const databases = await getDatabaseNames();

    // list the database names
    // console.log(databases);

    // set flag default to false

    let databaseExists = false;

    for (i = 0; i < databases.length; i++) {
        if (databases[i].datname == process.env.DATABASE) {
            // console.log("Database already exists");

            // set flag to true if database exists
            databaseExists = true;
        };
    };

    // if database does not exist, create it
    if (!databaseExists) {
        console.log(`Creating a new database with ${process.env.DATABASE}`);
        await createDatabase();
    };

    // Disconnect from the database to allow a new connection

    await dbDisconnect(true);
};

async function createDatabase() {
    // const query = `CREATE DATABASE "${process.env.DATABASE}"`;
    await setup.query(query);
};


async function dbConnect(init=false) {
    // connect to a database depending on init value

    if (init) {
        await setup.connect();
        // console.log(`Connected to the setup database`); 
    } else {
        await client.connect();
        console.log(`Connected to ${client.database} on port ${client.port}`);  
    };
};

async function dbDisconnect(init=false) {
    // disconnect from a database depending on init value

    if (init) {
        await setup.end();
        // console.log(`Disconnected from the setup database`);
    } else {
        await client.end();
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
            CONSTRAINT user_username_key UNIQUE (username),
            CONSTRAINT user_pkey PRIMARY KEY (id)
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

    // first part of the query will run, but if the table is already populate, it will throw an error. Try catch handles this.
    try {
        await client.query(query);
    } catch (error) {
        if (!error.constraint == 'ratecode_pkey') {
            console.log(error);
        };
    }
    
    
};

const buildCustomerAccessTokenTable = async () => {
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
