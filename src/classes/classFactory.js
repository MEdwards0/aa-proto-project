// Simple structure that takes in classes and exports them.
// Designed to be called in another file

const factory = (
    User,
    Admin
) => {

    // return the classes
    return {
        User,
        Admin
    }
};

// export the function to be called as: factory(User, Admin); elsewhere.

module.exports = factory;