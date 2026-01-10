const express = require('express');
const router = express.Router();

const controllers = require('./controllers');

router.use('/user', controllers.user_controller);
router.use('/notification', controllers.notification_controller);
router.use('/mentor_availability', controllers.availability_controller);
router.use('/mentor_sector', controllers.mentor_sector_controller);
router.use('/google_auth', controllers.google_auth_controller);
router.use('/session', controllers.session_controller);
router.use('/user_language', controllers.user_language_controller);
router.use('/review', controllers.review_controller);

module.exports = router;