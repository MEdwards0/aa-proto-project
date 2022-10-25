FROM node:18.10.0-alpine

LABEL author="Matt Edwards" version='0.1'

ENV DB_USER="username"
ENV DB_HOST=db
ENV DB_PASS="password"
ENV DB_PORT=5432
ENV DATABASE="test.docker.database"
ENV PORT=5000
ENV DEFAULT_ACCOUNT=true
ENV APP_LEVEL=DEV

COPY package*.json ./
RUN npm install

COPY . /.
EXPOSE $PORT

ENTRYPOINT [ "npm", "start" ]