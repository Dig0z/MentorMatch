const express = require('express');
const router = express.Router();
const notification_service = require('../services/notification_service.js');
const auth = require('../middleware/auth_middleware.js');

router.get('/fetch_notifications', auth, async (req, res) => {
    const user_id = req.user.id;
    const notifications = await notification_service.fetch_notifications(user_id);
    return res.status(200).json({
        message: 'All notifications fetched',
        success: true,
        data: notifications
    });
});

module.exports = router;