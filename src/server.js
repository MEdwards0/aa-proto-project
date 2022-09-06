const app = require('./app');
const { dbConnect, setupDatabase, buildSchemaTables} = require('./database/connection');
const {port} = require('./config')

const PORT = port;

app.listen(PORT, async () => {
    console.log(`Listening on port ${PORT}`);
    try {
        await setupDatabase();
    } catch (error) {
        console.log('There was an error in setting up database \n\n', error);
    }
    await dbConnect();
    buildSchemaTables();
});
