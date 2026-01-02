const express = require('express');
const router = express.Router();

const controllers = require('./controllers');

router.use('/user', controllers.user_controller);
router.use('/notification', controllers.notification_controller);

module.exports = router;