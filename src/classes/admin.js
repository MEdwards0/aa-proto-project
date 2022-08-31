function adminClass(User) {
    class Admin extends User {
        constructor(user, email, activeAccount = false) {
            super(user, email, activeAccount);
        };
    };

    return Admin
};



module.exports = {adminClass};