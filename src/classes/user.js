// Create a user class here for those using the application.

class User {
    constructor(username, activeAccount = false) {
        this.username = username;
        this.loggedIn = false;
        this.token = undefined;
        this.customerAccessToken = undefined;
        this.activeAccount = activeAccount;
        this.userLevel = 'user';
        this.customerNino = undefined;
    }

    getUser() { return this.user; };

    getEmail() { return this.email };

    getUserLevel() { return this.userLevel };

    getActiveAccount() { return this.activeAccount };

    getLoggedIn() { return this.loggedIn };

    setActiveAccount(toggle) {
        if (typeof toggle == 'boolean') {
            this.activeAccount = toggle;
        } else {
            console.log('user', this.user, 'failed to update active account');
            return 'failed to update active status'
        }
    };

    logIn() {
        this.loggedIn = true;
    };

    logOut() {
        this.loggedIn = false;
    };

    clearToken() {
        this.token = undefined;
    };

    setToken(token) {
        this.token = token;
    }

    getCustomerAccessToken() { return this.customerAccessToken };

    setCustomerAccessToken(token) {
        this.customerAccessToken = token;
    }

    clearCustomerAccessToken() {
        this.customerAccessToken = undefined;
    }

    setCustomerNino(nino) {
        this.customerNino = nino;
    };

    clearCustomerNino() {
        this.customerNino = undefined;
    }

    removeCustomerInfo() {
        this.customerNino = undefined;
        this.customerAccessToken = undefined;
    };

    sayHello() {
        console.log('Hello', this.username)
    }
};

// Export the User class for other files to use.

module.exports = { User };
