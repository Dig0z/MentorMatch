const express = require('express');
const router = express.Router();
const { sendEmail } = require('../services/email_service');

// Minimal endpoint to send an email via SendGrid >:( 
router.post('/send', async (req, res) => {
  try {
    const { to, subject, text = undefined, html = undefined, from = undefined } = req.body || {};
    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, and one of text or html',
      });
    }

    await sendEmail({ to, subject, text, html, from });
    return res.status(200).json({ success: true, message: 'Email sent' });
  } catch (error) {
    console.error('SendGrid error:', error?.response?.body || error.message || error);
    return res.status(500).json({ success: false, message: 'Failed to send email' });
  }
});

module.exports = router;
