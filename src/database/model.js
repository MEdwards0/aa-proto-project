const { client } = require('./connection');
const { encryptInput, checkEncryption } = require('../hash/encryptionModel');

const convertTimeDDMMYYYY = (date) => {
    const convertDate = new Date(date);
    const day = convertDate.getDate();
    const month = convertDate.getMonth() + 1;
    const year = convertDate.getFullYear();

    return `${day}/${month}/${year}`;
}

const addUser = async (username, password) => {
    try {
        const hash = await encryptInput(password);
        await client.query(`INSERT INTO "user" (username, password) VALUES ('${username}', '${hash}')`);
        // const result = await client.query(`SELECT * FROM "user" WHERE username = '${username}'`);
        const result = await client.query(`SELECT id FROM "user" WHERE username = '${username}'`);

        return {
            status: true,
            error: false,
            // username: result.rows[0].username,
            id: result.rows[0].id,
        }
    } catch (error) {
        // console.log(error.constraint);
        return {
            error: true,
        }
    }
};

const addAdmin = async (id) => {

    // if (!admin) {
    //     await client.query(`INSERT INTO "admin" (user_id) VALUES (${id})`);
    //     return true;
    // }

    try {
        await client.query(`INSERT INTO "admin" ("user_id", "isAdmin") VALUES (${id}, 'false')`);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
    
};

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

const addToken = async (userId, userName) => {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const query = `INSERT INTO "token" (token, user_id, user_name) VALUES ('${token}', ${userId}, '${userName}')`;
    await client.query(query);
    return token;
};

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

const deleteExpiredTokens = async () => {
    const query = `DELETE FROM "token" WHERE expires_at < NOW()`;
    await client.query(query);
};

const deleteUnusedTokens = async (token, name) => {
    const query = `DELETE FROM "token" WHERE "user_name" = '${name}' AND "token" != '${token}'`;
    await client.query(query);
};

const deleteToken = async (token) => {
    const query = `DELETE FROM "token" WHERE "token" = '${token}'`;
    await client.query(query);
};

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

const checkSecurityAnswers = async (nino, answerOne, answerTwo, answerThree) => {
    try {

        const query = `SELECT "answerOne", "answerTwo", "answerThree" FROM "customerSecurity" WHERE "NINO" = '${nino}'`;
        const result = await client.query(query);

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


const addCustomer = async (customer) => {
    // console.log('customer object is:', customer) // debug checking input

    try {
        const query = `INSERT INTO "customer" 
    ("NINO", "fName", "mName", "lName", "dob") 
    VALUES ('${customer.NINO}', '${customer.fName}', '${customer.mName}', '${customer.lName}', '${customer.dob}')`;
        await client.query(query);

        const customerQuery = `SELECT * FROM "customer" WHERE "NINO" = '${customer.NINO}'`;
        const result = await client.query(customerQuery);
        return result.rows[0];
    } catch (error) {
        console.log('model.js: addCustomer \n\n', error)
    };
};

const addCustomerAccessToken = async (user, nino) => {
    // Delete any entries where the user already has a token
    try {
        const query = `DELETE FROM "customerAccessToken" WHERE "user" = '${user}'`;
        await client.query(query);
    } catch (error) {
        console.log(error);
    };

    // Delete any existing token for the customer 

    try {
        const query = `DELETE FROM "customerAccessToken" WHERE "NINO" = '${nino}'`;
        await client.query(query);
    } catch (error) {
        console.log(error);
    };

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const query = `INSERT INTO "customerAccessToken" ("token", "user", "NINO") VALUES ('${token}', '${user}', '${nino}')`;
    await client.query(query);
    return token;
};

const checkCustomerAccessToken = async (token, user, nino) => {
    // If there is an error, set error to true and return a message. Else, return access token.

    // Return the token for the user and the customer.

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

const deleteCustomerAccessToken = async (token) => {

    try {
        const query = `DELETE FROM "customerAccessToken" WHERE TOKEN = '${token}'`;
        await client.query(query);
    } catch (error) {
        console.log(error);
    }
}

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

const addCustomerSecurity = async (customer) => {
    try {
        const answerOneFinal = await encryptInput(customer.answerOne);
        const answerTwoFinal = await encryptInput(customer.answerTwo);
        const answerThreeFinal = await encryptInput(customer.answerThree);

        const query = `INSERT INTO "customerSecurity" ("NINO", "questionOne", "answerOne", "questionTwo", "answerTwo", "questionThree", "answerThree") 
    VALUES ('${customer.NINO}', '${customer.questionOne}', '${answerOneFinal}', '${customer.questionTwo}', '${answerTwoFinal}', '${customer.questionThree}', '${answerThreeFinal}');`;

        await client.query(query);
    } catch (error) {
        console.log('model.js addCustomerSecurity \n\n', error);
    };
};

const getAllUsers = async (username) => {
    // return all users as an array of key value pairs, excluding the username specified.
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

const toggleAdmin = async (id) => {
    try {
        const query = `SELECT * FROM "admin" WHERE "user_id" = ${id};`;
        const response = await client.query(query);

        console.log('DEBUG - Server response. typeof isAdmin is:', typeof response.rows[0].isAdmin);

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

const toggleAccountActive = async (id, username) => {
    try {
        const query = `SELECT * FROM "user" WHERE "username" = '${username}' AND "id" = ${id};`;
        const response = await client.query(query);

        console.log('DEBUG - Server response. typeof accountActive is:', typeof response.rows[0].accountActive);

        if (response.rows[0].accountActive) {
            console.log('Setting accountActive to false \n');
            const request = `UPDATE "user" SET "accountActive" = 'false' WHERE "id" = ${id} AND "username" = '${username}';`;
            await client.query(request);
        } else {
            console.log('Setting accountActive to true \n');
            const request = `UPDATE "user" SET "accountActive" = 'true' WHERE "id" = ${id} AND "username" = '${username}';`;
            await client.query(request);
        }
    } catch (error) {
        console.log('model.js toggleAccountActive \n\n', error);
    }
};


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
