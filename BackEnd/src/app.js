const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '..', '.env')});
const exception_handler = require('./middlewares/exception_handler.js');
const express = require('express');
const app = express();
const bootstrap = require('./bootstrap.js');
const cors = require('cors');

require('./config/db.js');

app.use(cors());
app.use(express.json());

const routes = require('./routes.js');
app.use('/api', routes);
app.use(exception_handler);

bootstrap(app).catch(err => {
    if(!err.status) {
        err.status = 500;
    }
    console.error('Unexpected error.', err);
    process.exit(1);
});

module.exports = app;