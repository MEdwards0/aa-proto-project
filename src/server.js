const app = require('./app');
const { dbConnect, setupDatabase, buildSchemaTables} = require('./database/connection');

const PORT = 3001;

app.listen(PORT, async () => {
    console.log(`Listening on port ${PORT}`);
    try {
        await setupDatabase();
    } catch (error) {
        console.log('!!!!!!!!There was an error in setting up database!!!!!!!!');
    }
    await dbConnect();
    buildSchemaTables();
});
