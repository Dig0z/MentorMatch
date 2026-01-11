const {Pool} = require('pg');
const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '..', '.env')});

const pool = new Pool({
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    // Use custom search_path if provided, otherwise use default (public)
    ...(process.env.DB_SCHEMA && { options: `-c search_path=${process.env.DB_SCHEMA}` })
});

module.exports = {pool};