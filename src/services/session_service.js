const session_repository = require('../repositories/session_repository.js');
const user_service = require('../services/user_service.js');
const availability_service = require('../services/availability_service.js');
const google_service = require('./google_auth_service.js');

async function book_session(mentee_id, session_data) {
    const {mentor_email, date, start_time, end_time} = session_data;
    await availability_service.get_availability(date, start_time, end_time); //vedo solo se ritorna errore oppure no
    const mentor_id = await user_service.get_id_from_email(mentor_email);
    const status = 'pending';
    const start_datetime = `${date} ${start_time}`;
    const end_datetime = `${date} ${end_time}`;
    const result = await session_repository.book_session(mentor_id, mentee_id, start_datetime, end_datetime, status);
    if(!result) {
        const err = new Error('Failed to book session');
        err.status = 500;
        throw err;
    }
    return session;
}

async function confirm_booking(mentor_id, session_id) {
    const {id} = session_id;
    const meet_link = await google_service.createMeetLink();
    const {check_status} = await session_repository.update_status(id, mentor_id, 'confirmed');
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
    return session;
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
    return session;
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
    return deleted_session;
}

module.exports = {
    book_session,
    confirm_booking,
    cancel_session,
    confirm_cancellation
};