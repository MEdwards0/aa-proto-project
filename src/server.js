// This file runs the server and subsequently listens to the app.

const app = require('../app');
const { dbConnect, setupDatabase, buildSchemaTables, defaultAccount} = require('./database/connection');
const {port} = require('./config')

// Get the port from the config file.

const PORT = port;

// Upon running the server, try setting up the database. When connected, try to build the tables if they aren't there.

app.listen(PORT, async () => {
    console.log(`Listening on port ${PORT}`);

    try {
        await setupDatabase();
    } catch (error) {
        console.log('There was an error in setting up database \n\n', error);
    };

    await dbConnect();
    await buildSchemaTables();

    try {
        await defaultAccount();
    } catch (error) {
        console.log('default account not created.');
    };
    
});
