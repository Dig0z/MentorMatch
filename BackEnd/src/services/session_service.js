const session_repository = require('../repositories/session_repository.js');
const user_service = require('../services/user_service.js');
const availability_service = require('../services/availability_service.js');
const google_service = require('./google_auth_service.js');
const notification_service = require('../services/notification_service.js');
const { parseTimeToMinutes, normalizeToHHMMSS } = require('../utils/time');
const { normalizeSessionDateTimes, normalizeSessionArray } = require('../utils/datetime');
const { parseDateYMD } = require('../utils/date');

function httpError(status, message, details) {
    const err = new Error(message);
    err.status = status;
    if (details) err.details = details;
    return err;
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