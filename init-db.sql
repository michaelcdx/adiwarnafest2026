-- Create the database if it doesn't exist
SELECT 'CREATE DATABASE adiwarna'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'adiwarna')\gexec
