// This factory takes functions in as arguments and returns other functions that depend on them which are more usable to the application.

const factory = ({ 
    addUser, 
    getUser, 
    checkPassword, 
    addAdmin, 
    deleteExpiredTokens, 
    addToken, 
    checkToken, 
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
    addCustomer,
    addCustomerSecurity,
    getAllUsers,
    toggleAdmin,
    toggleAccountActive,
    adminQueryToken,
}) => {

    // Add a user to the database. Returns an error if there is a name taken. Also adds a record to the admin table
    // defaulted to false.

    const handleAddUser = async (username, password) => {

        // Get the result from calling addUser. This includes an error result and the issued user id.
        const result = await addUser(username, password);

        // If there is an error, return that to the server for further handling.
        if (result.error) {
            return {
                status: false,
                error: result.error
            };
        };

        // Call addAdmin and store the result of it here. Returns true or false.
        const response = await addAdmin(result.id);

        if (!response) {
            return {
                status: false,
                error: true
            };
        };
        
        return {
            status: true,
            error: false
        };
    };

    // Log in function to allow users into the app by username and password.

    const handleLogIn = async (username, password) => {
        try {
            // Clear the expired access tokens in the database to ensure only valid tokens remaimn.
            await deleteExpiredTokens();

            //  Get the user information and check that the passwords match.
            const user = await getUser(username);

            const hash = user.password;
            const result = await checkPassword(password, hash);

            // If status is okay, then add a new token to the database and return useable information.

            if (result.status) {

                const token = await addToken(user.id, user.username);
                return {
                    status: result.status,
                    error: false,
                    token: token,
                    profile: {
                        username: user.username,
                        id: user.id,
                        admin: user.admin,
                        accountActive: user.accountActive
                    }
                }
            }

            // If the function manages to get here, no valid information was found. return here with an error.
            return {
                status: result.status,
                error: true,
            }
            // Any catch errors, return with an error.
        } catch (error) {
            return {
                status: false,
                error: true
            };
        }
    };

    // Get a token from the database.

    const handleCheckToken = async (token, name) => {
        // Firstly get rid of any expired tokens so subsequent queries have up-to-date data.
        await deleteExpiredTokens();

        // Call the checkToken function using a token and a name. Returns a true or false status.
        const result = await checkToken(token, name);

        if (result.status) {
            // Remove all previous tokens for the user except the one we just got.
            await deleteUnusedTokens(token, name); 

            // return data for further use.
            return {
                status: result.status,
                error: false,
                token: result.token,
                profile: {
                    username: result.username,
                    id: result.id
                }
            };
        } else {
            // return an error
            return {
                status: false,
                error: true
            };
        };
    };

    // delete the inputted token from the database.
    const handleRemoveToken = async (token) => {
        await deleteToken(token);
    };

    // Validate the inputted nino against the database. Return with an error true or false.
    const handleValidateNino = async (nino) => {
        const result =  await findNino(nino);

        if (result.status) {
            return {error: false};
        };

        return {
            error: true,
            message: result.message
        };
    };

    // Get the security questions from the database that is related to the nino inputted. Returns the questions.
    const handleGetSecurityQuestions = async (nino) => {
        // first check for a valid nino.
        const response = await findNino(nino);

        if (response.status) {
            const result = await getSecurityQuestions(nino);

            return {
                error: false,
                questions: {
                    questionOne: result.rows[0].questionOne,
                    questionTwo: result.rows[0].questionTwo,
                    questionThree: result.rows[0].questionThree
                }
            }
        }

        return {error: true};
    };

    // Checks the answers inputted against what we have in the db. Returns an error status.
    const handleCheckSecurityAnswers = async (nino, answerOne, answerTwo, answerThree) => {
        const result = await checkSecurityAnswers(nino, answerOne, answerTwo, answerThree);

        if (!result) {
            return {
                error: true
            };
        }

        return {
            error: false
        };
    };

    // Take a nino and return all customer data.
    const handleGetCustomer = async (nino) => {
        const customer = await getCustomer(nino);
        const rate = await getAward(nino);

        if (customer.error) {
            // return with error being true
            return customer;
        }

        if (rate.error) {
            // return with error being true for rate response
            customer.error = rate.error;
            customer.errorMessage = rate.errorMessage;
        };

        customer.awardRate = rate.awardRate;

        return customer;
    };
    
    // Update claim that takes in an object.
    const handleUpdateClaim = async (object) => {
        const result = await addClaim(object);

        return result;
    };

    // Check customer access token in the database with what is inputted here. Returns an error response.

    const handleCheckCustomerAccessToken = async (token, user, nino) => {

        const response = await checkCustomerAccessToken(token, user, nino);

        if (response.error) {
            console.log(response.errorMessage);
            return {
                error: true,
                errorMessage: response.errorMessage
            }
        };

        return {
            error: response.error,
            errorMessage: response.errorMessage || 'none',
            token: response.token
        };

    };

    // Add a new customer access token with a user and a nino. Returns the issued token.

    const handleAddNewCustomerAccessToken = async (user, nino) => {
        const token = await addCustomerAccessToken(user, nino);
        return token;
    };

    // Add a new customer to the database. Customer is an object.

    const handleAddNewCustomer = async (customer) => {
        let errorMessage;

        try {
            const addCustomerResult = await addCustomer(customer);
            const customerSecurityResult = await addCustomerSecurity(customer);

            errorMessage = addCustomerResult.errorMessage || customerSecurityResult.errorMessage || false;

            if (customerSecurityResult.error || addCustomerResult.error) {

                return {
                    error: true,
                    errorMessage: errorMessage
                };
            }

            return {error: false}
        } catch (error) {
            console.log('controller.js handleAddNewCustomer \n\n', error);

            return {
                error: true,
                errorMessage: errorMessage
            }
        }
        
    };

    // Query the database and get all users, excluding the username which it was called with.

    const handleGetAllUsers = async (username) => {
        try {
            const users = await getAllUsers(username);

            return {
                users: users,
                error: false
            }
        } catch (error) {
            return {
                error: true
            }
        }
    };

    // Toggle admin status in the database using a user's id.

    const handleToggleAdmin = async (id) => {
        await toggleAdmin(id);
    }

    // Toggle a users account between active or inactive taking in a user id and a username.

    const handleToggleAccountActive = async (id, username) => {
        await toggleAccountActive(id, username);
    };

    // Query a token on the database using a username

    const handleAdminQueryToken = async (username) => {
        
        const result = await adminQueryToken(username.toUpperCase());
        return result;
    };

    // return the functions when the factory function is invoked. 

    return {
        handleAddUser,
        handleLogIn,
        handleCheckToken,
        handleRemoveToken,
        handleValidateNino,
        handleGetSecurityQuestions,
        handleCheckSecurityAnswers,
        handleGetCustomer,
        handleUpdateClaim,
        handleAddNewCustomerAccessToken,
        handleCheckCustomerAccessToken,
        handleAddNewCustomer,
        handleGetAllUsers,
        handleToggleAdmin,
        handleToggleAccountActive,
        handleAdminQueryToken
    }
};

// export the function to be used elsewhere.

module.exports = factory;
