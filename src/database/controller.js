const factory = ({ 
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
    addCustomerSecurity
}) => {

    const handleAddUser = async (username, password) => {
        const result = await addUser(username, password);

        if (result.error) {
            return {
                status: false,
                error: result.error
            }
        }
        const response = await addAdmin(result.id)
        return {
            status: true,
            error: false
        }
    };

    const handleLogIn = async (username, password) => {
        try {
            await deleteExpiredTokens();
            const user = await getUser(username);
            const hash = user.password;
            const result = await checkPassword(password, hash);

            if (result.status) {

                const token = await addToken(user.id, user.username);
                return {
                    status: result.status,
                    error: false,
                    token: token,
                    profile: {
                        username: user.username,
                        id: user.id,
                        admin: user.admin
                    }
                }
            }
            return {
                status: result.status,
                error: true,
            }

        } catch (error) {
            return {
                status: false,
                error: true
            };
        }
    };

    const handleGetToken = async (token, name) => {
        await deleteExpiredTokens();
        const result = await getToken(token, name);

        if (result.status) {
            await deleteUnusedTokens(token, name); // Remove all previous tokens for the user except the one we just got.

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
            return {
                status: false,
                error: true
            };
        };
    };

    const handleRemoveToken = async (token) => {
        await deleteToken(token);
    };

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

    const handleGetSecurityQuestions = async (nino) => {
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

    const handleUpdateClaim = async (object) => {
        const result = await addClaim(object);

        return result;
    };

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

    const handleAddNewCustomerAccessToken = async (user, nino) => {
        const token = await addCustomerAccessToken(user, nino);
        return token;
    };

    const handleAddNewCustomer = async (customer) => {
        try {
            await addCustomer(customer);
            await addCustomerSecurity(customer);
            return {error: false}
        } catch (error) {
            return {
                error: true,
                errorMessage: error
            }
        }
        
    };

    return {
        handleAddUser,
        handleLogIn,
        handleGetToken,
        handleRemoveToken,
        handleValidateNino,
        handleGetSecurityQuestions,
        handleCheckSecurityAnswers,
        handleGetCustomer,
        handleUpdateClaim,
        handleAddNewCustomerAccessToken,
        handleCheckCustomerAccessToken,
        handleAddNewCustomer
    }
};

module.exports = factory;
