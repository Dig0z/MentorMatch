const session_repository = require('../repositories/session_repository.js');
const user_service = require('../services/user_service.js');
const availability_service = require('../services/availability_service.js');
const google_service = require('./google_auth_service.js');
const notification_service = require('../services/notification_service.js');
const { sendEmail } = require('./email_service');
const { parseTimeToMinutes, normalizeToHHMMSS } = require('../utils/time');
const { normalizeSessionDateTimes, normalizeSessionArray } = require('../utils/datetime');
const { parseDateYMD } = require('../utils/date');

function httpError(status, message, details) {
    const err = new Error(message);
    err.status = status;
    if (details) err.details = details;
    return err;
}

function getFakeMeetLink() {
    return process.env.FAKE_MEET_LINK || 'https://meet.google.com/lookup/mentormatch-demo';
}

async function book_session(mentee_id, session_data) {
    const {mentor_email, date, start_time, end_time} = session_data || {};
    // Basic input validation
    if (!mentor_email || !mentor_email.includes('@')) {
        throw httpError(400, 'mentor_email is required and must contain @');
    }
    if (!date) throw httpError(400, 'date is required (YYYY-MM-DD)');
    if (!start_time) throw httpError(400, 'start_time is required (HH:MM)');
    if (!end_time) throw httpError(400, 'end_time is required (HH:MM)');

    // Parse/normalize time and date
    const { dateLocal } = parseDateYMD(String(date));
    const startMin = parseTimeToMinutes(String(start_time));
    const endMin = parseTimeToMinutes(String(end_time));
    if (startMin >= endMin) throw httpError(400, 'start_time must be strictly earlier than end_time');
    const sHHMMSS = normalizeToHHMMSS(String(start_time));
    const eHHMMSS = normalizeToHHMMSS(String(end_time));

    const mentor_id = await user_service.get_id_from_email(mentor_email);
    const mid = mentor_id.id || mentor_id;
    // Availability containment check (single block)
    await availability_service.get_availability(mid, date, sHHMMSS, eHHMMSS);

    const status = 'pending';
    const start_datetime = `${date} ${sHHMMSS}`;
    const end_datetime = `${date} ${eHHMMSS}`;

    // Overlap check with existing sessions (mentor side)
    const overlaps = await session_repository.find_overlaps_for_mentor(mid, start_datetime, end_datetime);
    if (overlaps && overlaps.length > 0) {
        const o = overlaps[0];
        throw httpError(409, 'Requested interval overlaps an existing session', { overlapping_session: o });
    }

    const session = await session_repository.book_session(mid, mentee_id, start_datetime, end_datetime, status);
    if(!session) {
        const err = new Error('Failed to book session');
        err.status = 500;
        throw err;
    }
    // Consume the booked time from mentor's availability (split/remove blocks)
    try {
        await availability_service.consume_availability(mid, date, sHHMMSS, eHHMMSS);
    } catch (consumeErr) {
        console.warn('Availability consume failed', consumeErr?.message || consumeErr);
    }
    // Send notification to mentor with mentee details and booking time
    try {
        const mentee = await user_service.get_me(mentee_id);
        const nameStr = [mentee?.name, mentee?.surname].filter(Boolean).join(' ');
        const sShort = sHHMMSS.slice(0,5);
        const eShort = eHHMMSS.slice(0,5);
        const message = `Nuova prenotazione da ${nameStr || 'Studente'} (${mentee?.email || '—'}) per il ${date} dalle ${sShort} alle ${eShort}`;
        await notification_service.send_notification(mid, message);

        // Email notifications (mentor and mentee)
        try {
            const mentor = await user_service.get_me(mid);
            const mentorName = [mentor?.name, mentor?.surname].filter(Boolean).join(' ');
            const meetLink = getFakeMeetLink();

            const subject = 'MentorMatch: Nuova prenotazione';
            const htmlMentor = `
                <p>Ciao ${mentorName || 'Mentor'},</p>
                <p>Hai ricevuto una nuova prenotazione.</p>
                <table style="border-collapse:collapse;width:100%">
                  <tr><td><strong>Mentee</strong></td><td>${nameStr || 'Studente'} (${mentee?.email || ''})</td></tr>
                  <tr><td><strong>Data</strong></td><td>${date}</td></tr>
                  <tr><td><strong>Orario</strong></td><td>${sShort} - ${eShort}</td></tr>
                  <tr><td><strong>Modalità</strong></td><td>Online (Google Meet)</td></tr>
                  <tr><td><strong>Link Meet</strong></td><td><a href="${meetLink}">${meetLink}</a></td></tr>
                </table>
                <p>Accedi a MentorMatch per confermare o gestire la sessione.</p>
            `;
            const textMentor = `Ciao ${mentorName || 'Mentor'},\nNuova prenotazione da ${nameStr || 'Studente'} (${mentee?.email || ''}) il ${date} dalle ${sShort} alle ${eShort}. Link Meet: ${meetLink}`;

            // Send to mentor
            if (mentor?.email) {
                await sendEmail({ to: mentor.email, subject, text: textMentor, html: htmlMentor });
            }

            // Send to mentee (confirmation)
            const subjectMentee = 'MentorMatch: Prenotazione inviata';
            const htmlMentee = `
                <p>Ciao ${nameStr || 'Studente'},</p>
                <p>La tua prenotazione è stata inviata.</p>
                <table style="border-collapse:collapse;width:100%">
                  <tr><td><strong>Mentor</strong></td><td>${mentorName || mentor?.email || ''}</td></tr>
                  <tr><td><strong>Data</strong></td><td>${date}</td></tr>
                  <tr><td><strong>Orario</strong></td><td>${sShort} - ${eShort}</td></tr>
                  <tr><td><strong>Modalità</strong></td><td>Online (Google Meet)</td></tr>
                  <tr><td><strong>Link Meet</strong></td><td><a href="${meetLink}">${meetLink}</a></td></tr>
                </table>
                <p>Riceverai un aggiornamento quando il mentor confermerà la sessione.</p>
            `;
            const textMentee = `Ciao ${nameStr || 'Studente'},\nPrenotazione inviata al mentor ${mentorName || mentor?.email || ''} per il ${date} dalle ${sShort} alle ${eShort}. Link Meet: ${meetLink}`;
            if (mentee?.email) {
                await sendEmail({ to: mentee.email, subject: subjectMentee, text: textMentee, html: htmlMentee });
            }
        } catch (mailErr) {
            console.warn('Email send failed (booking):', mailErr?.response?.body || mailErr?.message || mailErr);
        }
    } catch (notifyErr) {
        console.warn('Notification send failed', notifyErr?.message || notifyErr);
    }
    return normalizeSessionDateTimes(session);
}

async function confirm_booking(mentor_id, session_id) {
    const {id} = session_id;
    const check_session = await session_repository.get_session(id, mentor_id);
    if(!check_session) {
        const err = new Error('Session not found');
        err.status = 404;
        throw err;
    }
    const {start_datetime:start, end_datetime:end} = check_session;
    const start_date = new Date(start);
    const end_date = new Date(end);
    const iso_start = start_date.toISOString();
    const iso_end = end_date.toISOString();
    const meet_link = await google_service.createMeetLink(iso_start, iso_end);
    const {status:check_status} = await session_repository.update_status(id, mentor_id, 'confirmed');
    console.log(check_status);
    if(!check_status || check_status != 'confirmed') {
        const err = new Error('Failed to update booking status');
        err.status = 500;
        throw err;
    }
    const session = await session_repository.add_meeting_link(id, mentor_id, meet_link);
    const {meeting_link} = session;
    if(!meeting_link || meeting_link != meet_link) {
        const err = new Error('Failed to retrieve Meet link');
        err.status = 500;
        throw err;
    }
    return normalizeSessionDateTimes(session);
}

//Non elimino direttamente la session dal db per dare il tempo ad entrambi
//gli utenti di prendere atto della cancellazione
async function cancel_session(user_id, session_id) {
    const {id} = session_id;
    const session = await session_repository.update_status(id, user_id, 'cancelled');
    const {status} = session;
    if(!status || status != 'cancelled') {
        const err = new Error('Failed to cancel session');
        err.status = 500;
        throw err;
    }
    // Email notifications on cancellation
    try {
        const participants = await session_repository.get_session_participants(id);
        const { mentor_id, mentee_id } = participants || {};
        const self = await user_service.get_me(user_id);
        const mentor = mentor_id ? await user_service.get_me(mentor_id) : null;
        const mentee = mentee_id ? await user_service.get_me(mentee_id) : null;

        const sDate = new Date(session.start_datetime);
        const eDate = new Date(session.end_datetime);
        const dateStr = sDate.toISOString().slice(0,10);
        const sShort = String(session.start_datetime).slice(11,16);
        const eShort = String(session.end_datetime).slice(11,16);

        const mentorName = [mentor?.name, mentor?.surname].filter(Boolean).join(' ');
        const menteeName = [mentee?.name, mentee?.surname].filter(Boolean).join(' ');

        // Email to cancelling user (confirmation)
        const subjectSelf = 'MentorMatch: Conferma cancellazione';
        const htmlSelf = `
            <p>Ciao ${[self?.name, self?.surname].filter(Boolean).join(' ') || 'Utente'},</p>
            <p>La tua sessione è stata cancellata.</p>
            <table style="border-collapse:collapse;width:100%">
              <tr><td><strong>Mentor</strong></td><td>${mentorName || mentor?.email || ''}</td></tr>
              <tr><td><strong>Data</strong></td><td>${dateStr}</td></tr>
              <tr><td><strong>Orario</strong></td><td>${sShort} - ${eShort}</td></tr>
            </table>
        `;
        const textSelf = `Ciao ${[self?.name, self?.surname].filter(Boolean).join(' ') || 'Utente'},\nLa tua sessione è stata cancellata. Mentor: ${mentorName || mentor?.email || ''}. Data: ${dateStr}. Orario: ${sShort}-${eShort}.`;
        if (self?.email) {
            await sendEmail({ to: self.email, subject: subjectSelf, text: textSelf, html: htmlSelf });
        }

        // Email to other party (mentor or mentee)
        const isCancellerMentor = (user_id === mentor_id);
        const other = isCancellerMentor ? mentee : mentor;
        const otherRoleLabel = isCancellerMentor ? 'Mentee' : 'Mentor';
        const cancellerLabel = isCancellerMentor ? 'Mentor' : 'Mentee';
        const cancellerName = [self?.name, self?.surname].filter(Boolean).join(' ');
        const subjectOther = 'MentorMatch: Sessione cancellata';
        const htmlOther = `
            <p>Ciao ${[other?.name, other?.surname].filter(Boolean).join(' ') || otherRoleLabel},</p>
            <p>La sessione è stata cancellata da ${cancellerLabel}: ${cancellerName || self?.email || ''}.</p>
            <table style="border-collapse:collapse;width:100%">
              <tr><td><strong>Data</strong></td><td>${dateStr}</td></tr>
              <tr><td><strong>Orario</strong></td><td>${sShort} - ${eShort}</td></tr>
            </table>
        `;
        const textOther = `Ciao ${[other?.name, other?.surname].filter(Boolean).join(' ') || otherRoleLabel},\nLa sessione è stata cancellata da ${cancellerLabel}: ${cancellerName || self?.email || ''}. Data: ${dateStr}. Orario: ${sShort}-${eShort}.`;
        if (other?.email) {
            await sendEmail({ to: other.email, subject: subjectOther, text: textOther, html: htmlOther });
        }
    } catch (mailErr) {
        console.warn('Email send failed (cancellation):', mailErr?.response?.body || mailErr?.message || mailErr);
    }
    return normalizeSessionDateTimes(session);
}

async function confirm_cancellation(user_id, session_id) {
    const {id} = session_id;
    const session = await session_repository.get_session(id, user_id);
    if(!session) {
        const err = new Error('Session not found');
        err.status = 404;
        throw err;
    }
    const {status:check_status} = session;
    if(check_status != 'cancelled') {
        const err = new Error('Cannot confirm cancellation. Notify other user first,');
        err.status = 409;
        throw err;
    }
    const deleted_session = await session_repository.delete_session(id, user_id);
    return normalizeSessionDateTimes(deleted_session);
}

async function get_user_sessions(user_id) {
    const sessions = await session_repository.get_user_sessions(user_id);
    try {
        for (const row of sessions || []) {
            console.log('DB start_datetime raw:', row.start_datetime);
            try {
                const iso = new Date(row.start_datetime).toISOString();
                console.log('As ISO:', iso);
            } catch (e) {
                console.log('ISO conversion error:', e?.message);
            }
        }
    } catch (e) {
        console.log('Diagnostics logging failed:', e?.message);
    }
    return normalizeSessionArray(sessions || []);
}

module.exports = {
    book_session,
    confirm_booking,
    cancel_session,
    confirm_cancellation,
    get_user_sessions
};