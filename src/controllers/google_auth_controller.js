const express = require('express');
const router = express.Router();
const google = require('../google');

router.get("/google/auth", (req, res) => {
    const url = google.getAuthUrl();
    res.status(200).json({
        message: 'Authentication URL retrieved',
        success: true,
        data: {
            url: url
        }
    });
});

router.get("/google/callback", async (req, res) => {
    await google.setAuthCode(req.query.code);
    res.status(200).json({
        message: 'Authorization completed. Generating meet link...',
        success: true
    });
});

module.exports = router;