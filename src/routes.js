const express = require('express');
const router = express.Router();

const controllers = require('./controllers');

router.use('/user', controllers.user_controller);
router.use('/notification', controllers.notification_controller);
router.use('/mentor_availability', controllers.availability_controller);
router.use('mentor_sector', controllers.mentor_sector_controller);

module.exports = router;