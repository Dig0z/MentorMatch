require('dotenv').config({path: '../.env'});
const express = require('express');
const app = express();
const router = express.Router();

require('./config/db.js');

app.use(express.json());
router.use('/api', './routes.js');

const PORT = (process.env.DB_PORT || 3000);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});