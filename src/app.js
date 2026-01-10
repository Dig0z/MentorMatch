const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '..', '.env')});
const exception_handler = require('./middlewares/exception_handler.js');
const express = require('express');
const cors = require('cors');
const app = express();
const bootstrap = require('./bootstrap.js');

require('./config/db.js');

//CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

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
