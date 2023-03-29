#!/bin/bash
podman image build -t play-reading . ;

if [ ! "$(podman ps -a -q -f name=postgres-db)" ]; then
    if [ "$(podman ps -aq -f status=exited -f name=postgres-db)" ]; then
        # cleanup
        podman rm postgres-db
    fi
    # run the container
    podman run -v play_volume:/var/lib/postgresql/data \
    --name postgres-db -e POSTGRES_PASSWORD=pass \
    -e POSTGRES_USER=playreading -e POSTGRES_DB=playreadingparty \
    -d play-reading 
fi

# start development server
NODE_ENV=development \
concurrently "webpack-dev-server --color" "nodemon --inspect ./src/server.js"