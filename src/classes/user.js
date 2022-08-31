class User  {
    constructor (user, email, activeAccount=false) {
        this.user = user;
        this.email = email;
        this.loggedIn = false;
        this.token = undefined;
        this.customerAccessToken = undefined;
        this.activeAccount = activeAccount;
        this.userLevel = 'user';
    }

    getUser () {return this.user;};

    getEmail () {return this.email};

    getUserLevel () {return this.userLevel};

    getActiveAccount () {return this.activeAccount};

    getLoggedIn () {return this.loggedIn};

    setActiveAccount (toggle) {
        if (typeof toggle == 'boolean') {
            this.activeAccount = toggle;
        } else {
            console.log('user',this.user, 'failed to update active account');
        }
    };

    logIn () {
        this.loggedIn = true;
    };

    logOut () {
        this.loggedIn = false;
    };

    clearToken () {
        this.token = undefined;
    };

    setToken (token) {
        this.token = token;
    }

    getCustomerAccessToken () {return this.customerAccessToken};

    setCustomerAccessToken (token) {
        this.customerAccessToken = token;
    }

    clearCustomerAccessToken () {
        this.customerAccessToken = undefined;
    }

};

module.exports = {User};
