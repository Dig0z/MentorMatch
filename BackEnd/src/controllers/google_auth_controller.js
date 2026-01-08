const express = require('express');
const router = express.Router();
const google_auth_service = require('../services/google_auth_service.js');

router.get('/auth', (req, res) => {
    const url = google_auth_service.getAuthUrl();
    console.log();
    res.status(200).json({
        message: 'Authentication URL retrieved',
        success: true,
        data: {
            url: url
        }
    });
});

router.get('/callback', async (req, res) => {
    await google_auth_service.setAuthCode(req.query.code);
    res.status(200).json({
        message: 'Authorization completed. Generating meet link...',
        success: true
    });
});

module.exports = router;