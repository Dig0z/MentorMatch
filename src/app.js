const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '..', '.env')});
const express = require('express');
const app = express();

require('./config/db.js');

app.use(express.json());

const routes = require('./routes.js');
app.use('/api', routes);

const PORT = (process.env.PORT || 3000);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});