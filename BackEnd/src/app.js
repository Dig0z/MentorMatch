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

// Serve static frontend files
const frontendPath = path.resolve(__dirname, '..', '..', 'FrontEnd');
app.use(express.static(frontendPath));

// API routes
const routes = require('./routes.js');
app.use('/api', routes);

// Serve index.html for any other routes (SPA fallback)
app.get('*', (req, res, next) => {
    // Skip if it's an API route
    if (req.path.startsWith('/api')) {
        return next();
    }
    // Serve Home.html as the default page
    res.sendFile(path.join(frontendPath, 'Pages', 'Home.html'));
});

app.use(exception_handler);

bootstrap(app).catch(err => {
    if(!err.status) {
        err.status = 500;
    }
    console.error('Unexpected error.', err);
    process.exit(1);
});

module.exports = app;