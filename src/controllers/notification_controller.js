const express = require('express');
const router = express.Router();
const notification_service = require('../services/notification_service.js');
const auth = require('../middleware/auth_middleware.js');
const validate = require('../dtos/dto_middleware.js');

router.get('/fetch_notifications', auth, async (req, res) => {
    const user_id = req.user.id;
    const notifications = await notification_service.fetch_notifications(user_id);
    return res.status(200).json({
        message: 'All notifications fetched',
        success: true,
        data: notifications
    });
});

router.delete('/delete_notification/:id', validate(delete_notification_dto), auth, async (req, res) => {
    const result = await notification_service.delete_notification(req.params, req.user.id);
    return res.status(204).json({
        message: 'Notification deleted',
        success: true,
        data: result
    });
});

router.delete('/delete_all', auth, async (req, res) => {
    const result = await notification_service.delete_all(req.user.id);
    return res.status(204).json({
        message: 'All notifications deleted',
        success: true,
        data: result
    });
});

module.exports = router;