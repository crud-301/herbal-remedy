DROP TABLE IF EXISTS herbs;
DROP TABLE IF EXISTS add_herb;


CREATE TABLE herbs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    image_url TEXT,
    case_using TEXT,
    Preparation TEXT,
    description TEXT
);  


CREATE TABLE add_herb (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    image_url TEXT,
    case_using TEXT,
    Preparation TEXT,
    description TEXT
);  
