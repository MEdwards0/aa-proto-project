const { client } = require('./connection');
const { encryptPassword, comparePassword } = require('../hash/passwordModel');

const addUser = async (username, password) => {
    try {
        const hash = await encryptPassword(password);
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

const addAdmin = async (id, admin = false) => {

    if (!admin) {
        await client.query(`INSERT INTO "admin" (id) VALUES (${id})`);
        return true;
    }

    await client.query(`INSERT INTO "admin" (id, isAdmin) VALUES (${id}, 'true')`);
    return true;
};

const getUser = async (username) => {
    const query = `SELECT * FROM "user" WHERE username = '${username}'`;
    const result = await client.query(query);
    const adminQuery = `SELECT * FROM "admin" WHERE id = ${result.rows[0].id}`;
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
        admin: resultAdmin.rows[0].isAdmin
    }
}

const checkPassword = async (input, hash) => {
    const result = await comparePassword(input, hash);
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
            status: false
        };
    }

    return {
        status: true
    };
};

const getSecurityQuestions = async (nino) => {
    try {
    const query = `SELECT "NINO", "questionOne", "answerOne", "questionTwo", "answerTwo", "questionThree", "answerThree"
	FROM public."customerSecurity" WHERE "NINO" = '${nino}'`;

    const result = await client.query(query);
    return result;
    } catch (error) {
        console.log(error);
    }
};

const checkSecurityAnswers = async (nino, answerOne, answerTwo, answerThree) => {
    try {
        const query = `SELECT "answerOne", "answerTwo", "answerThree" FROM public."customerSecurity" WHERE "NINO" = '${nino}'`;
        const answers = await client.query(query);
        if (answers.rows[0].answerOne == answerOne && answers.rows[0].answerTwo == answerTwo && answers.rows[0].answerThree == answerThree) {
            return {
                error: false
            };
        }

        return {
            error: true
        };

    } catch (error) {
        console.log(error);
    }
}


// const addCustomer = async ({ customer }) => {
//     try {
//         const query = `INSERT INTO customer 
//     (NINO, fName, mName, lName, dob) 
//     VALUES ('${customer.NINO}', '${customer.fName}', '${customer.mName}', '${customer.lName}', '${customer.dob}')`;
//         await client.query(query);

//         const customerQuery = `SELECT * FROM customer WHERE NINO = '${customer.NINO}'`;
//         const result = await client.query(customerQuery);
//         return result.rows[0];
//     } catch (error) {
//         return error
//     }

// };



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
    checkSecurityAnswers
};
