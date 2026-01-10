const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const { sgMail } = require('../src/services/email_service');

const baseUrl = sgMail.client && sgMail.client.defaultRequest && sgMail.client.defaultRequest.baseUrl;
console.log('SendGrid client base URL:', baseUrl);
