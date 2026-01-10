const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const sgMail = require('@sendgrid/mail');

const API_KEY = process.env.SENDGRID_API_KEY;
if (!API_KEY) {
  throw new Error('SENDGRID_API_KEY is missing in environment');
}

sgMail.setApiKey(API_KEY);

const region = (process.env.SENDGRID_DATA_RESIDENCY || '').toLowerCase();
if (sgMail.client && typeof sgMail.client.setDataResidency === 'function') {
  if (region === 'eu' || region === 'europe') {
    sgMail.client.setDataResidency('eu');
  } else if (region === 'global') {
    sgMail.client.setDataResidency('global');
  }
}

async function sendEmail({ to, subject, text = undefined, html = undefined, from = undefined }) {
  const msg = {
    to,
    from: from || process.env.SENDGRID_FROM || 'no-reply@mentormatch.local',
    subject,
    text,
    html,
  };
  return sgMail.send(msg);
}

module.exports = { sendEmail, sgMail };
