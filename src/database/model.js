// This file depends on a database client implementation in order to make the subesequent calls we need.
// This file also depends on encryption methods from another file.

const { client } = require('./connection');
const { encryptInput, checkEncryption } = require('../hash/encryptionModel');

// Defined a helper function here to assist with bringing back date data in a useful format.

const convertTimeDDMMYYYY = (date) => {
    const convertDate = new Date(date);
    const day = convertDate.getDate();
    const month = convertDate.getMonth() + 1;
    const year = convertDate.getFullYear();

    // Return a plain string version of our date.
    return `${day}/${month}/${year}`;
}

// Function to add users to our database. Takes a username and a password. The username is encrypted.
// Returns the user id for use after adding to the database.

const addUser = async (username, password) => {
    try {
        const hash = await encryptInput(password);
        await client.query(`INSERT INTO "user" (username, password) VALUES ('${username}', '${hash}')`);
        const result = await client.query(`SELECT id FROM "user" WHERE username = '${username}'`);

        return {
            status: true,
            error: false,
            id: result.rows[0].id,
        }
    } catch (error) {
        // console.log(error.constraint);
        return {
            error: true,
        }
    }
};

// Function to add admins to the database that takes an id as an argument. This implementation sets the value to false.

const addAdmin = async (id) => {

    try {
        await client.query(`INSERT INTO "admin" ("user_id", "isAdmin") VALUES (${id}, 'false')`);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
    
};

// Get user data from the database where we can find the username. If not, return an error and a message, otherwise, the user data.

const getUser = async (username) => {
    const query = `SELECT * FROM "user" WHERE username = '${username}'`;
    const result = await client.query(query);
    const adminQuery = `SELECT * FROM "admin" WHERE user_id = ${result.rows[0].id}`;
    const resultAdmin = await client.query(adminQuery);

    if (result.rows[0] == undefined) {
        return {
            status: false,
            error: 'There was an error getting the user'
        }
    }

    return {
        status: true,
        username: result.rows[0].username,
        id: result.rows[0].id,
        password: result.rows[0].password,
        accountActive: result.rows[0].accountActive,
        admin: resultAdmin.rows[0].isAdmin
    }
}

// Function to take an input and check its hash value. Returns an error true or false depending on response.

const checkPassword = async (input, hash) => {
    const result = await checkEncryption(input, hash);
    if (result) {
        return {
            status: result,
            error: false
        }
    }
    return {
        status: result,
        error: true

    };
}

// Add a token using a userId and a username. Creates a random token each time then adds it to the database. Returns the same token at the end.

const addToken = async (userId, username) => {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const query = `INSERT INTO "token" (token, user_id, user_name) VALUES ('${token}', ${userId}, '${username}')`;
    await client.query(query);
    return token;
};

// Queries the database for a token and a name inputted here. Returns username, id and token data if a match is found.

const getToken = async (token, name) => {
    const query = `SELECT * FROM "token" WHERE token = '${token}' AND user_name = '${name}'`;
    const result = await client.query(query);
    if (result.rows[0] == undefined) {
        return {
            status: false
        }
    }
    return {
        status: true,
        token: result.rows[0].token,
        id: result.rows[0].user_id,
        username: result.rows[0].user_name
    }
};

// Deletes all expired tokens from the database.

const deleteExpiredTokens = async () => {
    const query = `DELETE FROM "token" WHERE expires_at < NOW()`;
    await client.query(query);
};

// Deletes any duplicate tokens for the user active user.

const deleteUnusedTokens = async (token, name) => {
    const query = `DELETE FROM "token" WHERE "user_name" = '${name}' AND "token" != '${token}'`;
    await client.query(query);
};

// Deletes any requested tokens from the database.

const deleteToken = async (token) => {
    const query = `DELETE FROM "token" WHERE "token" = '${token}'`;
    await client.query(query);
};

// Query to find an nino in the database. Returns with an object with a status property of true or false.

const findNino = async (nino) => {
    const query = `SELECT "NINO" FROM "customer" WHERE "NINO" = '${nino}'`
    const result = await client.query(query);

    if (result.rows[0] == undefined) {
        return {
            status: false,
            message: 'undefined'
        };
    }

    return {
        status: true,
        message: 'found'
    };
};

// Return security questions for the requested nino.

const getSecurityQuestions = async (nino) => {
    try {
        const query = `SELECT "NINO", "questionOne", "answerOne", "questionTwo", "answerTwo", "questionThree", "answerThree"
	FROM "customerSecurity" WHERE "NINO" = '${nino}'`;

        const result = await client.query(query);
        return result;
    } catch (error) {
        console.log(error);
    }
};

// Check security answers inputted for what we have in the database related to the inputted nino. Return true or false if they match.

const checkSecurityAnswers = async (nino, answerOne, answerTwo, answerThree) => {
    try {

        const query = `SELECT "answerOne", "answerTwo", "answerThree" FROM "customerSecurity" WHERE "NINO" = '${nino}'`;
        const result = await client.query(query);

        // Values are hashed in the db, so answers require converting. checkEncryption function returns true or false.

        const answerCheckOne = await checkEncryption(answerOne, result.rows[0].answerOne);
        const answerCheckTwo = await checkEncryption(answerTwo, result.rows[0].answerTwo);
        const answerCheckThree = await checkEncryption(answerThree, result.rows[0].answerThree);

        if (answerCheckOne && answerCheckTwo && answerCheckThree) {
            return true;
        };

        return false;

    } catch (error) {
        console.log(error);
    }
};

// Function to return all customer data for the inputted nino.

const getCustomer = async (nino) => {
    try {
        const query = `SELECT * FROM "customer" WHERE "NINO" = '${nino}'`;
        const result = await client.query(query);

        return {
            name: result.rows[0].fName,
            middleName: result.rows[0].mName,
            surname: result.rows[0].lName,
            deceased: result.rows[0].deceased,
            dob: convertTimeDDMMYYYY(result.rows[0].dob),
            dod: convertTimeDDMMYYYY(result.rows[0].dod),
            nino: result.rows[0].NINO,
            claimDateStart: convertTimeDDMMYYYY(result.rows[0].claimDateStart),
            claimDateEnd: convertTimeDDMMYYYY(result.rows[0].claimDateEnd),
            rateCode: result.rows[0].rateCode,
            claimedAA: result.rows[0].claimedAA,
            error: false
        }
    } catch (error) {
        return {
            error: true,
            errorMessage: error
        }
    }
};

// Function to get the award rate of the customer dependant on the nino.

const getAward = async (nino) => {
    try {
        let query = `SELECT "rateCode" FROM "customer" WHERE "NINO" = '${nino}'`;
        const result = await client.query(query);

        query = `SELECT "rate" FROM "rateCode" WHERE "code" = '${result.rows[0].rateCode}'`;
        const rate = await client.query(query);

        return {
            awardRate: rate.rows[0].rate,
            error: false
        };

    } catch (error) {

        return {
            error: true,
            errorMessage: error
        };
    };
};

// Update claim information for the customer in the databse. Takes an object as an argument. Returns an error of true or false.

const addClaim = async (object) => {
    try {
        const query = `UPDATE "customer" SET "claimDateStart"=NOW(), "rateCode"='${object.awardRate}', "claimedAA"='true' WHERE "NINO"='${object.nino}'`;
        await client.query(query);

        return {
            error: false,
        }
    } catch (error) {
        return {
            error: true,
            errorMessage: error
        }
    };
};

// Add a new customer to the database. This function takes a customer object with several properties passed in to be used. If there is an error,
// return an error of true and an error message. If there is no error, return the added customer.

const addCustomer = async (customer) => {

    try {
        const query = `INSERT INTO "customer" 
    ("NINO", "fName", "mName", "lName", "dob") 
    VALUES ('${customer.NINO}', '${customer.fName}', '${customer.mName}', '${customer.lName}', '${customer.dob}')`;
        await client.query(query);

        const customerQuery = `SELECT * FROM "customer" WHERE "NINO" = '${customer.NINO}'`;
        const result = await client.query(customerQuery);

        result.error = false;
        return result.rows[0];
    } catch (error) {
        console.log('model.js: addCustomer \n\n', error)
        return {
            error: true,
            errorMessage: 'Error adding customer to database.'
        };
    };
};

// Add a customer access token for a user using a nino. This is needed to allow the user to be able to access customer data. Only one token for the user or the nino can be used at any one time.
// Returns the issued token at the end.

const addCustomerAccessToken = async (user, nino) => {
    // Delete any entries where the user already has a token issued.
    try {
        const query = `DELETE FROM "customerAccessToken" WHERE "user" = '${user}'`;
        await client.query(query);
    } catch (error) {
        console.log(error);
        return false; // Quit the function here.
    };

    // Delete any existing token for the customer where a token is issued.

    try {
        const query = `DELETE FROM "customerAccessToken" WHERE "NINO" = '${nino}'`;
        await client.query(query);
    } catch (error) {
        console.log(error);
        return false; // Quit the function here.
    };

    // Create a new random token.

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const query = `INSERT INTO "customerAccessToken" ("token", "user", "NINO") VALUES ('${token}', '${user}', '${nino}')`;
    await client.query(query);
    return token;
};

// Checks the database for a customer access token, taking a toke, user and nino to check against. If there is an error, set error to true and return a message. 
// Else, return access token in an object.

const checkCustomerAccessToken = async (token, user, nino) => {

    try {
        const query = `SELECT * FROM "customerAccessToken" WHERE "token" = '${token}' AND "user" = '${user}' AND "NINO" = '${nino}'`;
        const result = await client.query(query);

        if (result.rows[0] == undefined) {
            return {
                error: true,
                errorMessage: 'Access token could not be found.'
            }
        };

        return {
            error: false,
            token: result.rows[0].token,
            id: result.rows[0].user_id,
            user: result.rows[0].user_name
        };

    } catch (error) {

        return {
            error: true,
            errorMessage: error
        };
    }

};

// Remove customer access token from the database wherever a match is found.

const deleteCustomerAccessToken = async (token) => {

    try {
        const query = `DELETE FROM "customerAccessToken" WHERE TOKEN = '${token}'`;
        await client.query(query);
    } catch (error) {
        console.log(error);
    }
}

// Check a customer access token, returning true or false as an error object.

const verifyCustomerAccessToken = async (token) => {
    try {
        const query = `SELECT * WHERE "token" = '${token}'`;
        const result = await client.query(query);

        if (result.rows[0].token == token) {
            return {
                error: false
            };
        };

        return {
            error: true
        };

    } catch (error) {
        return {
            error: true
        }
    }
};

// Add customer security answers when a new customer adds their information. Answers are encrypted at this stage. This function takes an object and needs required parameters for use.
// Returns an object with an error of true or false and an error message where necessary.

const addCustomerSecurity = async (customer) => {
    try {

        const answerOneFinal = await encryptInput(customer.answerOne);
        const answerTwoFinal = await encryptInput(customer.answerTwo);
        const answerThreeFinal = await encryptInput(customer.answerThree);

        const query = `INSERT INTO "customerSecurity" ("NINO", "questionOne", "answerOne", "questionTwo", "answerTwo", "questionThree", "answerThree") 
    VALUES ('${customer.NINO}', '${customer.questionOne}', '${answerOneFinal}', '${customer.questionTwo}', '${answerTwoFinal}', '${customer.questionThree}', '${answerThreeFinal}');`;

        await client.query(query);
    
        return {error: false, errorMessage: false};

    } catch (error) {
        console.log('model.js addCustomerSecurity \n\n', error);

        return {
            error: true,
            errorMessage: 'There was an error adding customer security to the database.'
        }
    };
};

// Return all users as an array of key value pairs, excluding the username specified.

const getAllUsers = async (username) => {
    try {
        const query = `SELECT * FROM "user" WHERE "username" != '${username}';`;
        const result = await client.query(query);
        const users = [];

        for (let i = 0; i < result.rows.length; i++) {


            const admin = await client.query(`SELECT "isAdmin" FROM "admin" WHERE "user_id" = ${result.rows[i].id};`);
            users.push({
                username: result.rows[i].username,
                activeAccount: result.rows[i].accountActive,
                id: result.rows[i].id,
                isAdmin: admin.rows[0].isAdmin
            });
        };

        return users;

    } catch (error) {
        console.log('model.js getAllUsers \n\n', error);

        return {
            error: true
        }
    }
};

// Toggle the admin status of a user, using their id which is found in the admin table. 

const toggleAdmin = async (id) => {
    try {
        const query = `SELECT * FROM "admin" WHERE "user_id" = ${id};`;
        const response = await client.query(query);

        if (response.rows[0].isAdmin) {
            const request = `UPDATE "admin" SET "isAdmin" = 'false' WHERE "user_id" = ${id};`;
            await client.query(request);
        } else {
            const request = `UPDATE "admin" SET "isAdmin" = 'true' WHERE "user_id" = ${id};`;
            await client.query(request);
        }
    } catch (error) {
        console.log('model.js toggleAdmin\n\n', error);
    }
};

// Toggle account activation status using both an id and username as parameters. 

const toggleAccountActive = async (id, username) => {
    try {
        const query = `SELECT * FROM "user" WHERE "username" = '${username}' AND "id" = ${id};`;
        const response = await client.query(query);

        if (response.rows[0].accountActive) {
            const request = `UPDATE "user" SET "accountActive" = 'false' WHERE "id" = ${id} AND "username" = '${username}';`;
            await client.query(request);
        } else {
            const request = `UPDATE "user" SET "accountActive" = 'true' WHERE "id" = ${id} AND "username" = '${username}';`;
            await client.query(request);
        }
    } catch (error) {
        console.log('model.js toggleAccountActive \n\n', error);
    }
};

// Export all functions here for use later.


module.exports = {
    addUser,
    getUser,
    checkPassword,
    addAdmin,
    deleteExpiredTokens,
    addToken,
    getToken,
    deleteToken,
    deleteUnusedTokens,
    findNino,
    getSecurityQuestions,
    checkSecurityAnswers,
    getCustomer,
    getAward,
    addClaim,
    addCustomerAccessToken,
    checkCustomerAccessToken,
    deleteCustomerAccessToken,
    verifyCustomerAccessToken,
    addCustomer,
    addCustomerSecurity,
    getAllUsers,
    toggleAdmin,
    toggleAccountActive
};
