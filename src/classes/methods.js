function getUser() { return this.user; };

function getUserLevel() { return this.userLevel };

function getActiveAccount() { return this.activeAccount };

function getLoggedIn() { return this.loggedIn };

function setActiveAccount(toggle) {
    if (typeof toggle == 'boolean') {
        this.activeAccount = toggle;
    } else {
        console.log('user', this.user, 'failed to update active account');
        return 'failed to update active status'
    }
};

function logIn() {
    this.loggedIn = true;
};

function logOut() {
    this.loggedIn = false;
};

function clearToken() {
    this.token = undefined;
};

function setToken(token) {
    this.token = token;
}

function getCustomerAccessToken() { return this.customerAccessToken };

function setCustomerAccessToken(token) {
    this.customerAccessToken = token;
}

function clearCustomerAccessToken() {
    this.customerAccessToken = undefined;
}

function setCustomerNino(nino) {
    this.customerNino = nino;
};

function clearCustomerNino() {
    this.customerNino = undefined;
}

function removeCustomerInfo() {
    this.customerNino = undefined;
    this.customerAccessToken = undefined;
};

function sayHello() {
    console.log('Hello', this.username)
}

function addClassMethods(object) {
    object.getUser = getUser;
    object.getUserLevel = getUserLevel;
    object.getActiveAccount = getActiveAccount;
    object.getLoggedIn = getLoggedIn;
    object.setActiveAccount = setActiveAccount;
    object.logIn = logIn;
    object.logOut = logOut;
    object.clearToken = clearToken;
    object.setToken = setToken;
    object.getCustomerAccessToken = getCustomerAccessToken;
    object.setCustomerAccessToken = setCustomerAccessToken;
    object.clearCustomerAccessToken = clearCustomerAccessToken;
    object.setCustomerNino = setCustomerNino;
    object.clearCustomerNino = clearCustomerNino;
    object.removeCustomerInfo = removeCustomerInfo;
    object.sayHello = sayHello;

}

module.exports = {
    addClassMethods
}

// Due to express sessions serializing as JSON, these cannot be stored there and need to be readded to the object each time.
