const express = require('express');
const router = express.Router();

const controllers = require('./controllers');

router.use('/user', controllers.user_controller);

module.exports = router;