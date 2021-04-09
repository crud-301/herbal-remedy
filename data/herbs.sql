DROP TABLE IF EXISTS herbs;

CREATE TABLE herbs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    image_url TEXT,
    case_using TEXT,
    Preparation TEXT,
    description TEXT
);  