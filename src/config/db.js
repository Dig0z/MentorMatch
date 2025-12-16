const {Pool} = require('pg');
require('dotenv').config({path: '../.env'});

const pool = new Pool({
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    schema: process.env.DB_SCHEMA
});

module.exports = {pool};