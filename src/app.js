require('dotenv').config({path: '../.env'});
const express = require('express');
const app = express();

require('./config/db.js');

app.use(express.json());

const PORT = (process.env.PORT || 3000);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});