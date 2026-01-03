CREATE TABLE users (
    id             SERIAL PRIMARY KEY,
    name           VARCHAR(100) NOT NULL,
    surname        VARCHAR(100) NOT NULL,
    email          VARCHAR(255) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    role           VARCHAR(20)  NOT NULL
                   CHECK (role IN ('mentor', 'mentee', 'admin')),
    bio            TEXT,
    photo_url      TEXT,
    created_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE mentor_sectors (
    mentor_id   INT NOT NULL,
    sector_name VARCHAR(100) NOT NULL,
    PRIMARY KEY (mentor_id, sector_name),
    FOREIGN KEY (mentor_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE mentor_availability (
    id          SERIAL PRIMARY KEY,
    mentor_id   INT NOT NULL,
    weekday     DATE NOT NULL,
    start_time  TIME NOT NULL,
    end_time    TIME NOT NULL,
    FOREIGN KEY (mentor_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CHECK (start_time < end_time)
);

CREATE TABLE sessions (
    id              SERIAL PRIMARY KEY,
    mentor_id       INT NOT NULL,
    mentee_id       INT NOT NULL,
    start_datetime  TIMESTAMP NOT NULL,
    end_datetime    TIMESTAMP NOT NULL,
    status          VARCHAR(20) NOT NULL
                    CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    meeting_link    TEXT,
    FOREIGN KEY (mentor_id) REFERENCES users(id)
        ON DELETE CASCADE,
    FOREIGN KEY (mentee_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CHECK (start_datetime < end_datetime)
);

CREATE TABLE reviews (
    id          SERIAL PRIMARY KEY,
    mentor_id   INT NOT NULL,
    mentee_id   INT NOT NULL,
    rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (mentor_id) REFERENCES users(id)
        ON DELETE CASCADE,
    FOREIGN KEY (mentee_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE notifications (
    id          SERIAL PRIMARY KEY,
    user_id     INT NOT NULL,
    message     TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);


