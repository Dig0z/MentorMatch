const {google} = require('googleapis');
const google_auth_repository = require('../repositories/google_auth_repository.js');

const saltRounds = 10;

const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

function getAuthUrl() {
    return client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/gmail.send'
        ],
        prompt: 'consent'
    });
}

async function setAuthCode(code) {

    const {tokens} = await client.getToken(code);
    const {access_token, refresh_token, scope, token_type, expiry_date} = tokens;
    const old_token = await google_auth_repository.get_tokens();

    if(!refresh_token && !old_token) {
        const err = new Error('Missing refresh token');
        err.status = 404;
        throw err;
    }

    let cypher_refresh_token;
    if(refresh_token) {
        cypher_refresh_token = cypher(refresh_token);
    } else if(old_token) {
        const {refresh_token:old_refresh} = old_token;
        cypher_refresh_token = old_refresh;
    }

    const cypher_access_token = cypher(access_token);   

    let result;
    if(!old_token) {
        result = await google_auth_repository.insert_token(cypher_access_token, cypher_refresh_token, scope, token_type, expiry_date);
    } else {
        const {id} = old_token;
        result = await google_auth_repository.update_token(id, cypher_access_token, cypher_refresh_token, scope, token_type, expiry_date);
    }

    const safe_refresh_token = decypher(cypher_refresh_token);
    const correct_tokens = {access_token, refresh_token:safe_refresh_token, scope, token_type, expiry_date};
    client.setCredentials(correct_tokens);

}

async function loadSavedTokens() {

    const tokens = await google_auth_repository.get_tokens();
    if(!tokens) {
        console.error('Token not found. Google Services unavailable at the moment');
        return;
    }

    const {access_token:cypher_access_token, refresh_token:cypher_refresh_token, scope, token_type, expiry_date} = tokens;
    const access_token = decypher(cypher_access_token);
    const refresh_token = decypher(cypher_refresh_token);
    const plain_tokens = {access_token, refresh_token, scope, token_type, expiry_date};
    client.setCredentials(plain_tokens);

}

async function createMeetLink(start_datetime, end_datetime) {

    const calendar = google.calendar({ version: 'v3', auth: client });

    const res = await calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        requestBody: {
            summary: 'Session confirmed',
            start: {
                dateTime: start_datetime
            },
            end: {
                dateTime: end_datetime
            },
            conferenceData: {
                createRequest: {
                    requestId: 'id-' + Date.now()
                }
            }
        }
    });

    console.log(`Google Meet link created`);
    return res.data.hangoutLink;
}

async function sendEmail({to, subject, html}) {
    const gmail = google.gmail({ version: "v1", auth: client });

    const messageParts = [
        `To: ${to}`,
        `Subject: ${subject}`,
        "Content-Type: text/html; charset=utf-8",
        "",
        html
    ];

    const message = messageParts.join("\n");

    const encodedMessage = Buffer.from(message)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    const res = await gmail.users.messages.send({
        userId: "me",
        requestBody: {
            raw: encodedMessage
        }
    });

    return res.data;
}

function cypher(string) {
    let cypher_string = '';
    for(let i = 0; i < string.length; i++) {
        const char_code = string.charCodeAt(i);
        let new_char_code = ((char_code + 3) % 126);
        if(new_char_code < 32) {
            new_char_code += 32;
        }
        const new_char = String.fromCharCode(new_char_code);
        cypher_string += new_char;
    }
    return cypher_string;
}

function decypher(cypher_string) {
    let string = '';
    for(let i = 0; i < cypher_string.length; i++) {
        const cypher_char_code = cypher_string.charCodeAt(i);
        let new_char_code = (cypher_char_code - 3);
        if(new_char_code < 32) {
        new_char_code += 32;
        }
        const new_char = String.fromCharCode(new_char_code);
        string += new_char;
    }
    return string;
}

module.exports = {
    getAuthUrl,
    setAuthCode,
    loadSavedTokens,
    createMeetLink,
    sendEmail
};
