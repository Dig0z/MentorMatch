const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '..', '.env')});
const exception_handler = require('./middleware/exception_handler.js');
const express = require('express');
const app = express();

require('./config/db.js');

app.use(express.json());

const routes = require('./routes.js');
app.use('/api', routes);
app.use(exception_handler);

const PORT = (process.env.PORT || 3000);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});