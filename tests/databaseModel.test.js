const model = require('../src/database/model'); // File we are testing

// Unit tests for /database/model.js
describe('model.js', () => {

    const encryptInput = (input) => {
        return 'encryptedPassword'
    };

    describe('addUser', () => {

        describe('When addUser is called', () => {

            test('it should return a valid object when ran correctly', async () => {

                const fakeDatabase = {
                    async query(string) {

                        return {
                            rows: [
                                {
                                    username: 'user',
                                    pass: 'password',
                                    id: 1
                                }]
                        }
                    }
                };

                const { addUser } = model(fakeDatabase, encryptInput, {});

                const result = await addUser('user', 'pass');

                expect(result).toStrictEqual({ status: true, error: false, id: 1 });
            });

            test('it should return an object with an error object when an error is thrown', async () => {

                const fakeDatabase = {
                    async query(string) {
                        throw 'There was an error'
                    }
                };

                const { addUser } = model(fakeDatabase, encryptInput, {});

                const result = await addUser('user', 'pass');

                expect(result).toStrictEqual({ error: true });
            });
        });

        describe('The SQL queries for addUser is correct', () => {

            const fakeDatabase = {
                async query(string) {

                    // console.log(string)

                    if (string === `INSERT INTO "user" (username, password) VALUES ('user', 'encryptedPassword')`) {
                        return true
                    };

                    if (string === `SELECT id FROM "user" WHERE username = 'user'`) {
                        return {
                            rows: [
                                {
                                    username: 'user',
                                    pass: 'password',
                                    id: 1
                                }]
                        }
                    }

                    throw 'SQL does not match'
                }
            };

            const { addUser } = model(fakeDatabase, encryptInput, {});

            test('The SQL queries should match and not cause an error.', async () => {
                const result = await addUser('user', 'pass');

                expect(result).toStrictEqual({ status: true, error: false, id: 1 });
            });
        });
    });

    describe('addAdmin', () => {

        describe('When addAdmin is called it should', () => {

            test('Return true when there are no errors', async () => {
                const fakeDatabase = {
                    async query(string) {
                        return true;
                    }
                };

                const { addAdmin } = model(fakeDatabase, encryptInput, {});


                const result = await addAdmin(33);

                expect(result).toBe(true);
            })

            test('Return false when there is an error', async () => {
                const fakeDatabase = {
                    async query(string) {
                        throw 'Manual error.'
                    }
                };

                const { addAdmin } = model(fakeDatabase, encryptInput, {});

                const result = await addAdmin(33);

                expect(result).toBe(false);
            });
        });

        describe('The SQL query for addAdmin is correct', () => {
            const fakeDatabase = {
                async query(string) {
                    if (string === `INSERT INTO "admin" ("user_id", "isAdmin") VALUES (33, 'false')`) {
                        return true
                    }

                    throw 'SQL does not match';
                }
            };

            const { addAdmin } = model(fakeDatabase, encryptInput, {});

            test('The SQL query should match and not cause an error.', async () => {

                const result = await addAdmin(33);
                expect(result).toBe(true);
            });
        });

    });

    describe('getUser', () => {

        const resp = {
            status: true,
            username: 'user',
            id: 1,
            password: 'pass',
            accountActive: true,
            admin: false
        };

        describe('When getUser is called it should', () => {
            test('It should return an object with a status of false and an error message when a user cannot be found.', async () => {

                const fakeDatabase = {
                    async query(string) {
                        return { rows: [] }
                    }
                }

                const { getUser } = model(fakeDatabase, encryptInput, {});
                const result = await getUser('user');

                expect(result).toStrictEqual({ status: false, error: 'There was an error getting the user' });
            });

            test('It should return an object with a status of true, and user information within an object.', async () => {

                const fakeDatabase = {
                    async query(string) {
                        return {
                            rows: [{
                                username: 'user',
                                id: 1,
                                password: 'pass',
                                accountActive: true,
                                isAdmin: false
                            }]
                        }
                    }
                }

                const { getUser } = model(fakeDatabase, encryptInput, {});
                const result = await getUser('user');

                expect(result).toStrictEqual(resp);
            });
        });

        describe('The SQL queries for getUser is correct', () => {

            const fakeDatabase = {
                async query(string) {

                    if (string === `SELECT * FROM "user" WHERE username = 'user'`) {
                        return {
                            rows: [{
                                id: 1,
                                username: 'user',
                                password: 'pass',
                                accountActive: true
                            }]
                        }
                    };

                    if (string === `SELECT * FROM "admin" WHERE user_id = 1`) {
                        return {
                            rows: [
                                {
                                    isAdmin: false
                                }]
                        }
                    }

                    throw 'SQL does not match'
                }
            };

            const { getUser } = model(fakeDatabase, encryptInput, {});

            test('The SQL queries should match and not cause an error.', async () => {
                const result = await getUser('user');

                expect(result).toStrictEqual(resp);
            });
        });
    });

    describe('checkPassword', () => {

        const checkEncryption = async (input, hash) => {

            return hash === input ? true : false;
        };

        const { checkPassword } = model({}, {}, checkEncryption);

        describe('When checkPassword is called', () => {

            test('It should return a useful object with a status: true and an error: false when password is okay.', async () => {

                const result = await checkPassword('password', 'password');
                expect(result).toStrictEqual({ status: true, error: false });

            });


            test('It should return a useful object with a status: false and an error: true when password does not match.', async () => {

                const result = await checkPassword('error', 'password');
                expect(result).toStrictEqual({ status: false, error: true });

            });
        });
    });

    describe('addToken', () => {

        describe('When add Token is run we should expect the', () => {

            const fakeDatabase = {
                async query(string) {

                }
            }
            const { addToken } = model(fakeDatabase, {}, {});

            test('Token to be more than 15 characters long', async () => {
                const token = await addToken(1, 'user');

                expect(token.length).toBeGreaterThan(15);
            });

            test('Token should be a random string', async () => {
                const token = await addToken(1, 'user');

                expect(token).toEqual(expect.stringMatching(/.+/))
            });
        });

        describe('The SQL query', () => {
            test('Should be what we expect', async () => {

                const fakeDatabase = {
                    async query(query) {

                        const token = query.match(/(?<=([']))(?:(?=(\\?))\2.)*?(?=\1)/g)[0];

                        if (query !== `INSERT INTO "token" (token, user_id, user_name) VALUES ('${token}', 1, 'exampleUsername')`) {
                            throw 'SQL does not match'
                        }
                    }
                }
                const { addToken } = model(fakeDatabase, {}, {});
                const result = await addToken(1, 'exampleUsername');

                expect(result).toEqual(expect.stringMatching(/.+/));
            });
        });
    });

    describe('getToken', () => {
        describe('When getToken is called it should', () => {
            test('Return a useful object that we can use , when seccessful', async () => {

                const fakeDatabase = {
                    async query(query) {
                        const variables = query.match(/(?<=([']))(?:(?=(\\?))\2.)*?(?=\1)/g);
                        const token = variables[0];
                        const username = variables[2];

                        // revisit this regex soon.!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

                        return {
                            rows: [
                                {
                                    token: token,
                                    user_id: 1,
                                    user_name: username
                                }]
                        }
                    }
                }
                const { getToken } = model(fakeDatabase, {}, {});

                const result = await getToken('exampleToken', 'usernameTest');

                expect(result).toStrictEqual({ status: true, token: 'exampleToken', id: 1, username: 'usernameTest' });
            });

            test('Return an object with a property of status and a value of false when rows is undefined', async () => {
                const fakeDatabase = {
                    async query(query) {
                        // throw 'Manual error'
                        return { rows: [] };
                    }
                };

                const { getToken } = model(fakeDatabase, {}, {});

                const result = await getToken('exampleToken', 'usernameTest');

                expect(result).toStrictEqual({ status: false });
            });
        });

        describe('The SQL should be correct', () => {
            test('The query should be what we expect', async () => {
                const fakeDatabase = {
                    async query(query) {
                        if (query === `SELECT * FROM "token" WHERE token = 'exampleToken' AND user_name = 'exampleUsername'`) {
                            return {
                                rows: [
                                    {
                                        token: 'token',
                                        user_id: 1,
                                        user_name: 'username'
                                    }]
                            }
                        }
                        console.log('SQL does not match');

                        throw 'SQL does not match'
                    }
                }

                const { getToken } = model(fakeDatabase, {}, {})
                const result = await getToken('exampleToken', 'exampleUsername');

                expect(result).toStrictEqual({ status: true, token: 'token', id: 1, username: 'username' })
            });
        });
    })

    describe('deleteExpiredTokens', () => {
        test('The SQL should be what we expect', async () => {

            const fakeDatabase = {
                async query(query) {
                    if (query != 'DELETE FROM "token" WHERE expires_at < NOW()') {
                        throw 'SQL does not match'
                    }
                }
            };

            const { deleteExpiredTokens } = model(fakeDatabase, {}, {});

            const result = await deleteExpiredTokens();
            expect(result).toBe(true);

        });
    });

    describe('deleteUnusedTokens', () => {
        test('The SQL should be what we expect', async () => {

            const fakeDatabase = {
                async query(query) {
                    if (query != `DELETE FROM "token" WHERE "user_name" = 'exampleUsername' AND "token" != 'exampleToken'`) {
                        throw 'SQL does not match'
                    }
                }
            };

            const { deleteUnusedTokens } = model(fakeDatabase, {}, {});
            const result = await deleteUnusedTokens('exampleToken', 'exampleUsername');
            expect(result).toBe(true);

        });
    });

    describe('deleteToken', () => {
        test('The SQL should be what we expect', async () => {

            const fakeDatabase = {
                async query(query) {
                    if (query != `DELETE FROM "token" WHERE "token" = 'exampleToken'`) {
                        throw 'SQL does not match'
                    };
                }
            };

            const { deleteToken } = model(fakeDatabase, {}, {});
            const result = await deleteToken('exampleToken');
            expect(result).toBe(true);
        });
    });

    describe('findNino', () => {
        describe('When run it should', () => {
            test("Return an object with {status: true, and message: 'found'}", async () => {

                const fakeDatabase = {
                    async query(query) {
                        return { rows: [{ found: 'something' }] };
                    }
                };

                const { findNino } = model(fakeDatabase, {}, {});
                const result = await findNino('nino');
                expect(result).toStrictEqual({ status: true, message: 'found' });
            });

            test("Return {status: false, message: 'undefined'} when no nino can be found", async () => {
                const fakeDatabase = {
                    async query(query) {
                        return { rows: [] };
                    }
                };

                const { findNino } = model(fakeDatabase, {}, {});
                const result = await findNino('nino');
                expect(result).toStrictEqual({ status: false, message: 'undefined' });
            });
        });

        describe('The SQL should be correct', () => {
            const fakeDatabase = {
                async query(query) {
                    if (query === `SELECT "NINO" FROM "customer" WHERE "NINO" = 'exampleNino'`) {
                        return { rows: [{ found: 'something' }] };
                    }

                    return { rows: [] };
                }
            }

            const { findNino } = model(fakeDatabase, {}, {});

            test('The nino should be what we expect and return a positive result', async () => {
                const result = await findNino('exampleNino');

                expect(result).toStrictEqual({ status: true, message: 'found' });
            });
        });
    });

    describe('getSecurityQuestions', () => {
        describe('When run we should expect', () => {
            test('it to return something from the database if it was successful', async () => {
                const fakeDatabase = {
                    async query(query) {
                        return 'something'
                    }
                };

                const { getSecurityQuestions } = model(fakeDatabase, {}, {});
                const result = await getSecurityQuestions('exampleNino');
                expect(result).toBe('something');
            });

            test('it to return false from the database if an error is thrown', async () => {
                const fakeDatabase = {
                    async query(query) {
                        throw 'Manual error'
                    }
                };

                const { getSecurityQuestions } = model(fakeDatabase, {}, {});
                const result = await getSecurityQuestions('exampleNino');
                expect(result).toBe(false);
            });
        });

        describe('We should expect SQL to ', () => {
            test('be correct and return any value', async () => {
                const fakeDatabase = {
                    async query(query) {
                        if (query === `SELECT "NINO", "questionOne", "answerOne", "questionTwo", "answerTwo", "questionThree", "answerThree"
        FROM "customerSecurity" WHERE "NINO" = 'exampleNino'`) {
                            return 'any value';
                        };

                        throw 'an error';
                    }
                };

                const { getSecurityQuestions } = model(fakeDatabase, {}, {});
                const result = await getSecurityQuestions('exampleNino');
                expect(result).toBe('any value');
            });
        });
    });

    describe('checkSecurityAnswers', () => {

        const checkEncryption = async (input, hash) => {

            return hash === input ? true : false;
        };


        describe('When run it should', () => {

            const fakeDatabase = {
                async query(query) {
                    return {
                        rows: [{
                            answerOne: 'A',
                            answerTwo: 'B',
                            answerThree: 'C'
                        }]
                    };
                }
            };

            const { checkSecurityAnswers } = model(fakeDatabase, {}, checkEncryption);

            test('return true when security answers are correct', async () => {
                const result = await checkSecurityAnswers('anyNino', 'A', 'B', 'C');
                expect(result).toBe(true);
            });

            test('return false when security answers are not correct', async () => {
                const result = await checkSecurityAnswers('anyNino', 'wrongAnswer', 'B', 'C');
                expect(result).toBe(false);
            });
        });

        describe('The SQL query', () => {

            const fakeDatabase = {
                async query(query) {
                    if (query === `SELECT "answerOne", "answerTwo", "answerThree" FROM "customerSecurity" WHERE "NINO" = 'AA12345ZZ'`) {
                        return {
                            rows: [{
                                answerOne: 'rightAnswer',
                                answerTwo: 'rightAnswer',
                                answerThree: 'rightAnswer'
                            }]
                        };
                    }

                }
            };

            const { checkSecurityAnswers } = model(fakeDatabase, {}, checkEncryption);

            test('should be what we expect', async () => {
                const result = await checkSecurityAnswers('AA12345ZZ', 'rightAnswer', 'rightAnswer', 'rightAnswer');
                expect(result).toBe(true);
            });
        })
    });

    describe('getCustomer', () => {
        const fakeDatabase = {
            async query(query) {
                if (query === `SELECT * FROM "customer" WHERE "NINO" = 'AA12345ZZ'`) {
                    return {
                        rows: [{
                            fName: 'firstName',
                            mName: 'middleName',
                            lName: 'lastName',
                            deceased: false,
                            dob: '2018-04-20',
                            dod: null,
                            NINO: 'AA12345ZZ',
                            claimDateStart: '2020-02-20',
                            claimDateEnd: null,
                            rateCode: 'H',
                            claimedAA: true
                        }]
                    }
                }

                throw 'Customer not found'
            }
        }

        const { getCustomer } = model(fakeDatabase, {}, {})

        describe('When run it should', () => {
            test('return customer information to be used as an object if a valid customer is found', async () => {
                const result = await getCustomer('AA12345ZZ');

                const resp = {
                    name: 'firstName',
                    middleName: 'middleName',
                    surname: 'lastName',
                    deceased: false,
                    dob: '20/4/2018',
                    dod: '1/1/1970',
                    nino: 'AA12345ZZ',
                    claimDateStart: '20/2/2020',
                    claimDateEnd: '1/1/1970',
                    rateCode: 'H',
                    claimedAA: true,
                    error: false
                }
                expect(result.error).toBe(false);
                expect(result).toStrictEqual(resp)
            });

            test('return {error: true} as a response if a customer is not found', async () => {
                const result = await getCustomer('ZZ12345AA');
                expect(result.error).toBe(true);
                expect(result.errorMessage).toBe('Customer not found');

            });
        });
    })

    describe('getAward', () => {
        const fakeDatabase = {
            async query(query) {
                if (query === `SELECT "rateCode" FROM "customer" WHERE "NINO" = 'AA12345ZZ'`) {
                    return {
                        rows: [{ rateCode: 'H' }]
                    };
                };

                if (query === `SELECT "rateCode" FROM "customer" WHERE "NINO" = 'AB12345ZZ'`) {
                    return {
                        rows: [{ rateCode: 'L' }]
                    };
                };

                if (query === `SELECT "rateCode" FROM "customer" WHERE "NINO" = 'AC12345ZZ'`) {
                    return {
                        rows: [{ rateCode: 'N' }]
                    };
                };

                if (query === `SELECT "rate" FROM "rateCode" WHERE "code" = 'H'`) {
                    return {
                        rows: [{ rate: 92.4 }]
                    };
                };

                if (query === `SELECT "rate" FROM "rateCode" WHERE "code" = 'L'`) {
                    return {
                        rows: [{ rate: 61.85 }]
                    };
                };


                if (query === `SELECT "rate" FROM "rateCode" WHERE "code" = 'N'`) {
                    return {
                        rows: [{ rate: 0 }]
                    };
                };

                throw 'Nothing found'

            }
        };

        const { getAward } = model(fakeDatabase, {}, {});

        describe('When run it should', () => {
            test('return {error: false} when a valid customer is found', async () => {
                const result = await getAward('AA12345ZZ');
                expect(result.error).toBe(false);
            });

            test('return {awardRate: 92.4} when a customer has a rateCode of H', async () => {
                const result = await getAward('AA12345ZZ');
                expect(result.awardRate).toBe(92.4);
            });

            test('return {awardRate: 61.85} when a customer has a rateCode of L', async () => {
                const result = await getAward('AB12345ZZ');
                expect(result.awardRate).toBe(61.85);
            });

            test('return {awardRate: 0} when a customer has a rateCode of N', async () => {
                const result = await getAward('AC12345ZZ');
                expect(result.awardRate).toBe(0);
            });

            test('return {error: true} when there is an error (customer or rate code not found)', async () => {
                const result = await getAward('ZZZZZZZZZ');
                expect(result.error).toBe(true);
            });

            test('return an error message when there is an error', async () => {
                const result = await getAward('ZZZZZZZZZ');
                expect(result.errorMessage).toBe('Nothing found');
            });
        });
    });

    describe('addClaim', () => {
        const fakeDatabase = {
            async query(query) {
                if (query === `UPDATE "customer" SET "claimDateStart"=NOW(), "rateCode"='H', "claimedAA"='true' WHERE "NINO"='AA12345ZZ'`) {
                    return true;
                };

                throw 'Manual error';
            }
        };

        const { addClaim } = model(fakeDatabase, {}, {});

        describe('When run is should', () => {
            test('Return {error: false} when there are no errors', async () => {
                const inputObj = {
                    awardRate: 'H',
                    nino: 'AA12345ZZ'
                }
                const result = await addClaim(inputObj);
                expect(result.error).toBe(false);
            });

            test('Return {error: false} when there is an error', async () => {
                const inputObj = {
                    awardRate: 'H',
                    nino: 'AB12345ZZ'
                }
                const result = await addClaim(inputObj);
                expect(result.error).toBe(true);
            });

            test('Return {errorMessage: Manual error} when there is an error', async () => {
                const inputObj = {
                    awardRate: 'H',
                    nino: 'AB12345ZZ'
                }
                const result = await addClaim(inputObj);
                expect(result.errorMessage).toBe('Manual error');
            });
        });

    });

    describe('addCustomer', () => {

        const input = {
            NINO: 'AA12345ZZ',
            fName: 'firstName',
            mName: 'middleName',
            lName: 'lastName',
            dob: '1950-06-01T00:00:00.000Z'
        }

        const fakeDatabase = {
            async query(query) {

                if (query === `INSERT INTO "customer" 
        ("NINO", "fName", "mName", "lName", "dob") 
        VALUES ('AA12345ZZ', 'firstName', 'middleName', 'lastName', '1950-06-01T00:00:00.000Z')`) {
                    return;
                }

                if (query === `SELECT * FROM "customer" WHERE "NINO" = 'AA12345ZZ'`) {
                    return {
                        rows: [{
                            fName: 'firstName',
                            mName: 'middleName',
                            lName: 'lastName'
                        }]
                    };
                }

                throw 'SQL does not match';
            }
        }

        const { addCustomer } = model(fakeDatabase, {}, {});

        describe('When run it should', () => {
            test('If there are no errors, return a database object and error should be false', async () => {
                const result = await addCustomer(input);
                expect(result.error).toBe(false);
                expect(result).toStrictEqual({ fName: 'firstName', mName: 'middleName', lName: 'lastName', error: false });
            });

            test('If there is an error, return an error being false and a message', async () => {
                input.NINO = 'error'
                const result = await addCustomer(input);
                expect(result.error).toBe(true);
                expect(result.errorMessage).toBe('Error adding customer to database.')
            });
        });
    });

    describe('checkCustomerAccessToken', () => {

        const fakeDatabase = {
            async query(query) {
                if (query === `DELETE FROM "customerAccessToken" WHERE "user" = 'exampleUsername'`) {
                    return
                }

                if (query === `DELETE FROM "customerAccessToken" WHERE "NINO" = 'AA12345ZZ'`) {
                    return
                }

                const token = query.match(/(?<=([']))(?:(?=(\\?))\2.)*?(?=\1)/g)[0];

                if (query === `INSERT INTO "customerAccessToken" ("token", "user", "NINO") VALUES ('${token}', 'exampleUsername', 'AA12345ZZ')`) {
                    return
                }

                throw 'SQL does not match';
            }
        }

        const { addCustomerAccessToken } = model(fakeDatabase, {}, {})


        describe('When it runs', () => {
            test('if there are no errors, return a random token', async () => {
                const result = await addCustomerAccessToken('exampleUsername', 'AA12345ZZ')
                expect(result).toEqual(expect.stringMatching(/.+/))
            });

            test('if there is an error, return false', async () => {
                const result = await addCustomerAccessToken('badUsername', 'InvalidNino')
                expect(result).toBe(false);
            });
        });
    });

    describe('checkCustomerAccessToken', () => {
        const fakeDatabase = {
            async query(query) {
                if (query === `SELECT * FROM "customerAccessToken" WHERE "token" = 'exampleToken' AND "user" = 'exampleUsername' AND "NINO" = 'AA12345ZZ'`) {
                    return {
                        rows: [{
                            token: 'exampleToken',
                            user_id: 1,
                            user_name: 'exampleUsername'
                        }]
                    }
                }

                if (query === `SELECT * FROM "customerAccessToken" WHERE "token" = 'error' AND "user" = 'error' AND "NINO" = 'error'`) {
                    console.log('INSIDE THE THROW BLOCK')
                    throw 'SQL does not match'
                };

                return { rows: [] }

            }
        };

        const { checkCustomerAccessToken } = model(fakeDatabase, {}, {});

        describe('When run it should', () => {
            test('Return an expected object when there are no errors', async () => {
                const result = await checkCustomerAccessToken('exampleToken', 'exampleUsername', 'AA12345ZZ');
                expect(result).toStrictEqual({ error: false, token: 'exampleToken', id: 1, user: 'exampleUsername' });
            });

            test('Return an expected object when an access token could not be found', async () => {
                const result = await checkCustomerAccessToken('exampleToken', 'exampleUsername', 'BadNino');
                expect(result).toStrictEqual({ error: true, errorMessage: 'Access token could not be found.' });
            });

            test('Return an expected object when an error is thrown', async () => {
                const result = await checkCustomerAccessToken('error', 'error', 'error');
                expect(result).toStrictEqual({ error: true, errorMessage: 'SQL does not match' });
            })
        });
    });

    describe('deleteCustomerAccessToken', () => {
        const fakeDatabase = {
            async query(query) {
                if (query === `DELETE FROM "customerAccessToken" WHERE TOKEN = 'exampleToken'`) {
                    return;
                };

                throw 'error';
            }
        };

        const { deleteCustomerAccessToken } = model(fakeDatabase, {}, {})
        describe('The SQL', () => {
            test('should be correct and not throw any errors', async () => {
                const result = await deleteCustomerAccessToken('exampleToken');
                expect(result).toBe(true);
            });
        });
    })

    describe('addCustomerSecurity', () => {
        const fakeDatabase = {
            async query(query) {

                if (query === `INSERT INTO "customerSecurity" ("NINO", "questionOne", "answerOne", "questionTwo", "answerTwo", "questionThree", "answerThree") 
        VALUES ('AA12345ZZ', 'questionOne', 'encryptedPassword', 'questionTwo', 'encryptedPassword', 'questionThree', 'encryptedPassword');`) {
                    return;
                }

                throw 'SQL does not match';
            }
        };

        const { addCustomerSecurity } = model(fakeDatabase, encryptInput, {});

        describe('When run it should', () => {
            test('return {error: false, errorMessage: false} if there are no errors', async () => {
                const validInput = {
                    NINO: 'AA12345ZZ',
                    questionOne: 'questionOne',
                    questionTwo: 'questionTwo',
                    questionThree: 'questionThree',
                    answerOne: 'input',
                    answerTwo: 'input',
                    answerThree: 'input'
                };
                const result = await addCustomerSecurity(validInput);
                expect(result).toStrictEqual({ error: false, errorMessage: false });
            });

            test('return {error: true, errorMessage: ...} if there are no errors', async () => {
                const invalidInput = {
                    NINO: 'error',
                    questionOne: 'questionOne',
                    questionTwo: 'questionTwo',
                    questionThree: 'questionThree',
                    answerOne: 'input',
                    answerTwo: 'input',
                    answerThree: 'input'
                };
                const result = await addCustomerSecurity(invalidInput);
                expect(result).toStrictEqual({ error: true, errorMessage: 'There was an error adding customer security to the database.' });
            });
        });
    });

    describe('getAllUsers', () => {
        const fakeDatabase = {
            async query(query) {

                if (query === `SELECT * FROM "user" WHERE "username" != 'exampleUsername';`) {
                    return {
                        rows: [{
                            username: 'user1',
                            accountActive: true,
                            id: 1,
                        },
                        {
                            username: 'user2',
                            accountActive: false,
                            id: 2,
                        },
                        {
                            username: 'user3',
                            accountActive: true,
                            id: 3,
                        },
                        {
                            username: 'user4',
                            accountActive: true,
                            id: 4,
                        }]
                    }
                };

                if (query === `SELECT "isAdmin" FROM "admin" WHERE "user_id" = 1;`) {
                    return {rows: [{isAdmin: false}]}
                };

                if (query === `SELECT "isAdmin" FROM "admin" WHERE "user_id" = 2;`) {
                    return { rows: [{ isAdmin: false }] }
                };

                if (query === `SELECT "isAdmin" FROM "admin" WHERE "user_id" = 3;`) {
                    return { rows: [{ isAdmin: true }] }
                };

                if (query === `SELECT "isAdmin" FROM "admin" WHERE "user_id" = 4;`) {
                    return { rows: [{ isAdmin: false }] }
                };

                throw 'SQL does not match';

            }
        };

        const { getAllUsers } = model(fakeDatabase, {}, {});

        describe('When run it should', () => {
            test('return an array of objects if there are no errors', async () => {

                const result = await getAllUsers('exampleUsername');
                expect(result).toStrictEqual([{
                    username: 'user1',
                    activeAccount: true,
                    id: 1,
                    isAdmin: false
                },
                {
                    username: 'user2',
                    activeAccount: false,
                    id: 2,
                    isAdmin: false
                },
                {
                    username: 'user3',
                    activeAccount: true,
                    id: 3,
                    isAdmin: true
                },
                {
                    username: 'user4',
                    activeAccount: true,
                    id: 4,
                    isAdmin: false
                }]);
            });

            test('return {error: true} if there is an error', async () => {
                const result = await getAllUsers('noUser');
                expect(result).toStrictEqual({ error: true});
            });
        });
    });

    describe('toggleAdmin', () => {
        const fakeDatabase = {
            async query(query) {
                if (query === `SELECT * FROM "admin" WHERE "user_id" = 1;`) {
                    return {rows: [{isAdmin: true}]};
                } else if (query === `SELECT * FROM "admin" WHERE "user_id" = 2;`) {
                    return { rows: [{ isAdmin: false }] };
                };

                if (query === `UPDATE "admin" SET "isAdmin" = 'false' WHERE "user_id" = 1;`) {
                    return
                }

                if (query === `UPDATE "admin" SET "isAdmin" = 'true' WHERE "user_id" = 2;`) {
                    return
                }

                throw 'error';
            }
        };

        const { toggleAdmin } = model(fakeDatabase, {}, {})
        describe('When run it should', () => {
            test('return true and not throw any errors', async () => {
                const result1 = await toggleAdmin(1);
                const result2 = await toggleAdmin(2);
                expect(result1).toBe(true);
                expect(result2).toBe(true);
            });

            test('return false if there is an error', async () => {
                const result = await toggleAdmin(3);
                expect(result).toBe(false);
            });
        });
    })

    describe('toggleAccountActive', () => {
        const fakeDatabase = {
            async query(query) {
                if (query === `SELECT * FROM "user" WHERE "username" = 'exampleUsername' AND "id" = 1;`) {
                    return { rows: [{ accountActive: true }] };
                } else if (query === `SELECT * FROM "user" WHERE "username" = 'exampleUsername' AND "id" = 2;`) {
                    return { rows: [{ accountActive: false }] };
                };

                if (query === `UPDATE "user" SET "accountActive" = 'false' WHERE "id" = 1 AND "username" = 'exampleUsername';`) {
                    return
                }

                if (query === `UPDATE "user" SET "accountActive" = 'true' WHERE "id" = 2 AND "username" = 'exampleUsername';`) {
                    return
                }

                throw 'error';
            }
        };

        const { toggleAccountActive } = model(fakeDatabase, {}, {})
        describe('When run it should', () => {
            test('return true and not throw any errors', async () => {
                const result1 = await toggleAccountActive(1, 'exampleUsername');
                const result2 = await toggleAccountActive(2, 'exampleUsername');
                expect(result1).toBe(true);
                expect(result2).toBe(true);
            });

            test('return false if there is an error', async () => {
                const result = await toggleAccountActive(3, 'badUser');
                expect(result).toBe(false);
            });
        });
    })
});
