const session_repository = require('../repositories/session_repository.js');
const user_service = require('../services/user_service.js');
const availability_service = require('../services/availability_service.js');

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
}

module.exports = {
    book_session,
};