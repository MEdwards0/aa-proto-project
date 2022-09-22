A .env file should be placed inside the root folder (same level as this readme).

Set up the file to contain the following, replacing the appropriate variables with your postgres database credentials.
The following are default values.

DB_USER="username"
DB_HOST="localhost"
DB_PASS="password"
DB_PORT=5432
# The database here does not need to exist yet, but still needs assignment. A new database will be created if it doesn't exist.
DATABASE="database.name"

# This is the default port. If no other port is specified, 3000 will be used.
PORT=3000

# If this is set to true, then a default admin account will be created. default username will be 'admin' and the password will be 'pass'.
DEFAULT_ACCOUNT=false

- requires node version 17.6.0+ to run.
- run all dependencies by going to terminal and typing in the root folder: npm install
- run the program by typing from the root folder in terminal: npm start



ALL OF THIS IS SUBJECT TO CHANGE.