-- Define the database schema for the GeoNarrative application

CREATE TABLE stories (
    id SERIAL PRIMARY KEY,
    words TEXT,
    images JSONB,
    location GEOGRAPHY(POINT, 4326)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

