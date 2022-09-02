function adminClass(User) {
    class Admin extends User {
        constructor(username, password, activeAccount = false) {
            super(username, password, activeAccount);
            this.userLevel = 'admin';
        };
    };

    return Admin
};



module.exports = {adminClass};