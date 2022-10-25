# About

This application is a WIP *prototype* of an AA front end application designed to illustrate employee use of a simple interface for processing claimants. This is a very simple app and is in no way truly reflective of real procedures and contains no sensitive information whatsoever. This is purely a proof of concept.

---

# How to run

## Docker version:

### Instructions:

- Ensure you have the docker client installed and it is running.

- Go to the **root** of the application (the same level as this readme).

- Run the application by typing the following in terminal:

`docker-compose build`

`docker-compose up`

The application should now be running. If no settings have been altered, the exposed port will be 8080. Going to *localhost:8080* on your browser should connect to the homepage.

### Notes:

- Environment variables can be altered in *node.dockerfile* to suit your needs.
- Final port mapping can be changed in *docker-compose.yml*. Default is set to 8080.
- By default, a user account is created upon startup. postgres will start displaying harmless errors when started up again and the default account has already been created.
- The default account credentials are **user**: *admin* **pass**: *pass*
- New user accounts can be created by following links in the footer on the home page.
- Forgot password is there as a placeholder and has no functionality.
- Change password is also there as a placeholder.

---

## Non docker version:

### Requirements

- In order to run the application, you will need to have [postgres](https://www.postgresql.org/) installed and set up.

- Additionally, you will need to create a file named .env inside the root of the project (same level as this readme).

- Place this inside the file:

```
DB_USER="postgres"
DB_HOST="localhost"
DB_PASS="password"
DB_PORT=5432
DATABASE="test.database"

PORT=3000

DEFAULT_ACCOUNT=true

APP_LEVEL="DEV"
```

- These values can be changed to whatever you require them to be.

- If the database doesn't exist, the application will try to create it when starting up with the name specified at *DATABASE*.

- *APP_LEVEL* can be changed between "DEV" and "PROD" to alter the type of logs that are displayed.

### Instructions:

- At the root of the project, in terminal, type:

`npm i`

`npm start`

- The application should now be running.
