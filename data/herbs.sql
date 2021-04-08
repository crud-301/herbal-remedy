DROP TABLE IF EXISTS herbs;

CREATE TABLE herbs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    image_url VARCHAR(255),
    origin VARCHAR(255),
    description TEXT
);  