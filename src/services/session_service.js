const session_repository = require('../repositories/session_repository.js');
const user_service = require('./user_service.js');
const {send_notification} = require('./notification_service.js');
const availability_service = require('./availability_service.js');
const google_service = require('./google_auth_service.js');

async function book_session(mentee_id, session_data) {

    const {mentor_email, date, start_time, end_time} = session_data;
    await availability_service.get_availability(date, start_time, end_time); //vedo solo se ritorna errore oppure no
    const mentor_id = await user_service.get_id_from_email(mentor_email);

    if(!mentor_id) {
        const err = new Error('User not found');
        err.status = 404;
        throw err;
    }

    const status = 'pending';
    const start_datetime = `${date} ${start_time}`;
    const end_datetime = `${date} ${end_time}`;
    const session = await session_repository.book_session(mentor_id, mentee_id, start_datetime, end_datetime, status);

    if(!session) {
        const err = new Error('Failed to book session');
        err.status = 500;
        throw err;
    }

    const mentee_email = await user_service.get_email_from_id(mentee_id);

    console.log(`Session booked on ${date}, ${start_time} - ${end_time}. Status: ${status}`);
    const mentee_message = `
        Session booked on ${date}, ${start_time} - ${end_time}.\n
        We'll let you know when the mentor confirms
    `;
    await send_notification(mentee_id, mentee_message);
    await google_service.sendEmail({
        to: mentee_email,
        subject: 'New session booked',
        html: mentee_message
    });

    const mentor_message = `
        A mentee has booked a session on ${date} from ${start_time} to ${end_time}.\n
        Remember to confirm to add a Google Calendar event and obtain the Google Meet link!
    `;
    await send_notification(mentor_id, mentor_message);
    await google_service.sendEmail({
        to: mentor_email,
        subject: 'New session booked',
        html: mentor_message
    });

    return session;
}

async function confirm_booking(mentor_id, session_id) {

    const {id} = session_id;
    const check_session = await session_repository.get_session(id, mentor_id);

    if(!check_session) {
        const err = new Error('Session not found');
        err.status = 404;
        throw err;
    }

    const {mentee_id, start_datetime:start, end_datetime:end} = check_session;
    const start_date = new Date(start);
    const end_date = new Date(end);
    const iso_start = start_date.toISOString();
    const iso_end = end_date.toISOString();
    const meet_link = await google_service.createMeetLink(iso_start, iso_end);
    const {status:check_status} = await session_repository.update_status(id, mentor_id, 'confirmed');

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

    const mentor_email = await user_service.get_email_from_id(mentor_id);
    const mentee_email = await user_service.get_email_from_id(mentee_id);

    console.log(`Booking confermed for session on ${start_datetime} - ${end_datetime}. Meet link: ${meeting_link}`);
    const mentee_message = `
        Your mentor has confirmed the session on ${start_datetime} - ${end_datetime}!\n
        Don't forget to check out the Google Calendar event! Your Google Meet link: ${meeting_link}
    `;
    const mentor_message = `
        Session on ${start_datetime} - ${end_datetime} confirmed!\n
        Don't forget to check out the Google Calendar event! Your Google Meet link: ${meeting_link}
    `;
    await send_notification(mentee_id, mentee_message);
    await google_service.sendEmail({
        to: mentee_email,
        subject: 'Session confirmed',
        html: mentee_message
    });

    await send_notification(mentor_id, mentor_message);
    await google_service.sendEmail({
        to: mentor_email,
        subject: 'Session confirmed',
        html: mentor_message
    });

    return session;
}

//Non elimino direttamente la session dal db per dare il tempo ad entrambi
//gli utenti di prendere atto della cancellazione
async function cancel_session(user_id, session_id) {
    const {id} = session_id;
    const session = await session_repository.update_status(id, user_id, 'cancelled');
    const {mentor_id, mentee_id, start_datetime, end_datetime, status} = session;
    if(!status || status != 'cancelled') {
        const err = new Error('Failed to cancel session');
        err.status = 500;
        throw err;
    }
    console.log(`Booking cancelled for session on ${start_datetime} - ${end_datetime}`);

    //Invio della notifica e scelta dei destinatari
    const mentee_email = await user_service.get_email_from_id(mentee_id);
    const mentor_email = await user_service.get_email_from_id(mentor_id);
    let canceller_role;
    let other_role;
    if(user_id == mentor_id) {
        canceller_role = 'mentor';
        other_role = 'mentee';
    } else {
        canceller_role = 'mentee';
        other_role = 'mentor';
    }
    const canceller_message = `
        Booking cancelled for session on ${start_datetime} - ${end_datetime} :(\n
        Your ${other_role} will be notified and will remove the event
    `;
    await send_notification(canceller_role == 'mentor'? mentor_id : mentee_id, canceller_message);
    await google_service.sendEmail({
        to: canceller_role == 'mentor'? mentor_email : mentee_email,
        subject: 'Session cancelled',
        html: canceller_message
    });

    const receiver_message = `
        Your ${canceller_role} cancelled the session booked on ${start_datetime} - ${end_datetime} :(\n
        Remember to confirm the cancellation to remove the event
    `;
    await send_notification(canceller_role == 'mentor'? mentee_id : mentor_id, receiver_message);
    await google_service.sendEmail({
        to: canceller_role == 'mentor'? mentee_email : mentor_email,
        subject: 'Session cancelled',
        html: receiver_message
    });

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
    const {mentor_id, mentee_id, start_datetime, end_datetime, status:check_status} = session;
    if(check_status != 'cancelled') {
        const err = new Error('Cannot confirm cancellation. Notify other user first,');
        err.status = 409;
        throw err;
    }
    const deleted_session = await session_repository.delete_session(id, user_id);
    console.log(`Booking for session on ${start_datetime} - ${end_datetime} removed`);

    const mentor_email = await user_service.get_email_from_id(mentor_id);
    const mentee_email = await user_service.get_email_from_id(mentee_id);

    let canceller_role;
    let other_role;
    if(user_id == mentor_id) {
        canceller_role = 'mentor';
        other_role = 'mentee';
    } else {
        canceller_role = 'mentee';
        other_role = 'mentor';
    }
    const canceller_message = `
        Session and evenet removed on ${start_datetime} - ${end_datetime} :(
    `;
    await send_notification(canceller_role == 'mentor'? mentor_id : mentee_id, canceller_message);
    await google_service.sendEmail({
        to: canceller_role == 'mentor'? mentor_email : mentee_email,
        subject: 'Event deleted',
        html: canceller_message
    });

    const receiver_message = `
        Your ${canceller_role} confirmed the session deletion on ${start_datetime} - ${end_datetime} :(\n
        Google Calendar event has been removed
    `;
    await send_notification(canceller_role == 'mentor'? mentee_id : mentor_id, receiver_message);
    await google_service.sendEmail({
        to: canceller_role == 'mentor'? mentee_email : mentor_email,
        subject: 'Event deleted',
        html: receiver_message
    });

    return deleted_session;
}

async function get_user_sessions(user_id) {
    user_id;
    const sessions = await session_repository.get_user_sessions(user_id);
    if(!sessions || sessions.length == 0) {
        const err = new Error('No sessions found');
        err.status = 404;
        throw err;
    }
    console.log(`${sessions.length} sessions booked`);
    return sessions;
}

module.exports = {
    book_session,
    confirm_booking,
    cancel_session,
    confirm_cancellation,
    get_user_sessions
};