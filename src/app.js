require('dotenv').config();
const express = require('express');
const app = Express();

require('config.js');

app.use(express.json());

const PORT = (process.env.PORT || 3000);
app.listen(PORT, () => {
    console.log('Server listening on port ${PORT}');
});