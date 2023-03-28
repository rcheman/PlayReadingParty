FROM docker.io/postgres:15.2

COPY ./databaseSetup/db-setup.sql /docker-entrypoint-initdb.d/
COPY ./databaseSetup/db-setup-testdata.sql /docker-entrypoint-initdb.d/
