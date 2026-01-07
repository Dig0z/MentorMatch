const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '..', '.env')});
const exception_handler = require('./middlewares/exception_handler.js');
const express = require('express');
const app = express();
const google_auth_service = require('./services/google_auth_service.js');

require('./config/db.js');

app.use(express.json());

const routes = require('./routes.js');
app.use('/api', routes);
app.use(exception_handler);

await google_auth_service.loadSavedTokens();

const PORT = (process.env.PORT || 5000);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});