-- keeps track of the actors participating in the play reading
CREATE TABLE actors
(
    id   SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL
);

-- keeps track of the play scripts available to read
CREATE TABLE scripts
(
    id       SERIAL PRIMARY KEY,
    title    VARCHAR NOT NULL,
    filename VARCHAR NOT NULL
);

-- keeps track of the characters in each script and the actor that plays them
CREATE TABLE characters
(
    id           SERIAL PRIMARY KEY,
    script_id    SERIAL REFERENCES scripts (id) ON DELETE CASCADE,
    -- A NULL actor_id indicates that the character is not currently assigned to any actor
    actor_id     INTEGER REFERENCES actors (id) ON DELETE SET NULL,
    name         VARCHAR NOT NULL,
    line_count   INT     NOT NULL,
    speaks_count INT     NOT NULL
);

-- keeps track of how far an actor has read through a particular script
CREATE TABLE read_position
(
    id        SERIAL PRIMARY KEY,
    actor_id  SERIAL REFERENCES actors (id) ON DELETE CASCADE,
    script_id SERIAL REFERENCES scripts (id) ON DELETE CASCADE,
    -- number between 0.00 (beginning) and 1.00 (end) representing how far through the script page the actor has scrolled
    position  NUMERIC(5, 4) NOT NULL,
    -- enforce that each actor_id and script_id combination in the read_position table can only exist once
    -- since a actor should not have more than one read position in a script
    constraint read_position_uq unique (actor_id, script_id)
);

