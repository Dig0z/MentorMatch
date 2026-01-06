const {google} = require('googleapis');
const fs = require('fs');

const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

function getAuthUrl() {
    return client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar'],
        prompt: 'consent'
    });
}

async function setAuthCode(code) {
    const { tokens } = await client.getToken(code);
    fs.writeFileSync('google_tokens.json', JSON.stringify(tokens));
    client.setCredentials(tokens);
}

function loadSavedTokens() {
    if (fs.existsSync('google_tokens.json')) {
        const tokens = JSON.parse(fs.readFileSync('google_tokens.json'));
        client.setCredentials(tokens);
    }
}

async function createMeetLink() {
    const calendar = google.calendar({ version: 'v3', auth: client });

    const res = await calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        requestBody: {
            summary: 'Session confirmed',
            conferenceData: {
                createRequest: {
                    requestId: 'id-' + Date.now()
                }
            }
        }
    });

  return res.data.hangoutLink;
}

module.exports = {
    getAuthUrl,
    setAuthCode,
    loadSavedTokens,
    createMeetLink
};
