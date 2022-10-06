// Create an admin class that extends from a User class. Written as a function to pass in the User class.

function adminClass(User) {
    class Admin extends User {
        constructor(username, activeAccount = false) {
            super(username, activeAccount);
            this.userLevel = 'admin';
        };
    };

    //  Return the class.

    return Admin
};

// Export the class for other files to use.

module.exports = {adminClass};