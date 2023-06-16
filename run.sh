#!/bin/bash

# Pass "dev" as an argument to run the dev server

# rebuild container
podman image build -t play-reading . ;

# run the container
podman run -v play_volume:/var/lib/postgresql/data \
--name postgres-db \
-e POSTGRES_PASSWORD=pass \
-e POSTGRES_USER=playreading \
-e POSTGRES_DB=playreadingparty \
-p 5432:5432 \
-d play-reading

function cleanup {
  echo "Removing postgres-db container"
  podman stop postgres-db
  podman rm postgres-db
}
trap cleanup EXIT


if [ "$1" = "dev" ]; then
  # start development server
  NODE_ENV=development \
  concurrently \
    "webpack-dev-server --color" \
    "nodemon --inspect ./src/server.js" \
    "npm run css -- --watch --format beautify" \
    "cargo watch -x check -x test -x run"
else
  # start production server
  concurrently \
    "node src/server.js" \
    "cargo run --release"
fi
