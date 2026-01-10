const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const { sendEmail } = require('../src/services/email_service');

(async () => {
  try {
    const to = 'diegoguidi9@gmail.com';
    const subject = 'MentorMatch - Test Email';
    const text = 'Hola Diego, este es un test de envío de correo desde MentorMatch.';
    const html = '<p>Hola Diego,</p><p>Este es un <strong>test</strong> de envío de correo desde MentorMatch.</p>';
    const from = process.env.SENDGRID_FROM; // optional, defaults in service if not set

    await sendEmail({ to, subject, text, html, from });
    console.log('Email sent to', to);
  } catch (err) {
    // SendGrid often includes detailed error body
    const body = err?.response?.body;
    console.error('Failed to send email:', body || err.message || err);
    process.exitCode = 1;
  }
})();
