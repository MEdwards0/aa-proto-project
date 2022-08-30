A .env file should be placed inside the src folder.

Set up the file to contain the following, replacing the appropriate variables with your postgres database credentials.
The following are default values.

DB_USER="username"
DB_HOST="localhost"
DB_PASS="password"
DB_PORT=5432
# The database here does not need to exist, but still needs assignment.
DATABASE="database.name"

- requires node version 17.6.0 to run.
- run all dependencies by going to terminal and typing in the root folder: npm install
- run the program by going to the 'src' folder in terminal and type: node server.js

ALL OF THIS IS SUBJECT TO CHANGE.