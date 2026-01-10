// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// Using global (default) SendGrid endpoint for this test

const msg = {
  to: 'diegoguidi9@gmail.com',
  from: 'diegoguidi9@gmail.com',
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};

sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent');
  })
  .catch((error) => {
    console.error(error.response?.body || error);
    process.exit(1);
  });
