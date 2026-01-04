const { google } = require('googleapis');

const client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

function getAuthUrl() {
  return client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar"],
  });
}

async function setAuthCode(code) {
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  return tokens;
}

async function createMeetLink(userTokens) {
  const userClient = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  userClient.setCredentials(userTokens);

  const calendar = google.calendar({ version: "v3", auth: userClient });

  const res = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    requestBody: {
      summary: "Meeting generato dal server",
      conferenceData: {
        createRequest: {
          requestId: "id-" + Date.now(),
        },
      },
    },
  });

  return res.data.hangoutLink;
}

module.exports = {
  getAuthUrl,
  setAuthCode,
  createMeetLink
};
