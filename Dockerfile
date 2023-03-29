FROM docker.io/postgres:15.2

COPY ./db-setup.sql /docker-entrypoint-initdb.d/
COPY ./db-setup-testdata.sql /docker-entrypoint-initdb.d/
