const path = require('path');
const {pool} = require(path.resolve(__dirname, '..', 'config', 'db.js'));

async function book_session(mentor_id, mentee_id, start_datetime, end_datetime, status) {
    const query = `
        INSERT INTO sessions(mentor_id, mentee_id, start_datetime, end_datetime, status)
        VALUES($1, $2, $3, $4, $5)
        RETURNING id, start_datetime, end_datetime, status
    `;
    const values = [mentor_id, mentee_id, start_datetime, end_datetime, status];
    const result = await pool.query(query, values);
    return result.rows[0];
};

async function update_status(id, user_id, status) {
    const query = `
        UPDATE sessions
        SET status = $1
        WHERE id = $2
        AND (mentor_id = $3 OR mentee_id = $3)
        RETURNING id, start_datetime, end_datetime, status, meeting_link
    `;
    const result = await pool.query(query, [status, id, user_id]);
    return result.rows[0];
};

async function add_meeting_link(id, user_id, meeting_link) {
    const query = `
        UPDATE sessions
        SET meeting_link = $1
        WHERE id = $2
        AND (mentor_id = $3 OR mentee_id = $3)
        RETURNING id, start_datetime, end_datetime, status, meeting_link
    `;
    const values = [meeting_link, id, user_id];
    const session = await pool.query(query, values);
    return session.rows[0];
}

async function delete_session(id, user_id) {
    const query = `
        DELETE
        FROM sessions
        WHERE id = $1
        AND (mentor_id = $2 OR mentee_id = $2)
        RETURNING start_datetime, end_datetime, status
    `;
    const result = await pool.query(query, [id, user_id]);
    return result.rows[0];
}

async function get_session(id, user_id) {
    const query = `
        SELECT id, mentor_id, mentee_id, start_datetime, end_datetime, status, meeting_link
        FROM sessions
        WHERE id = $1
        AND (mentor_id = $2 OR mentee_id = $2)
    `;
    const result = await pool.query(query, [id, user_id]);
    return result.rows[0];
}

async function get_user_sessions(user_id) {
    const query = `
        SELECT id, start_datetime, end_datetime, status, meeting_link
        FROM sessions
        WHERE (mentor_id = $1 OR mentee_id = $1)
    `;
    const result = await pool.query(query, [user_id]);
    return result.rows;
}

async function find_overlaps_for_mentor(mentor_id, start_datetime, end_datetime) {
    const query = `
        SELECT id, start_datetime, end_datetime, status
        FROM sessions
        WHERE mentor_id = $1
        AND status IN ('pending','confirmed')
        AND start_datetime < $3
        AND end_datetime > $2
    `;
    const result = await pool.query(query, [mentor_id, start_datetime, end_datetime]);
    return result.rows;
}

module.exports = {
    book_session,
    update_status,
    add_meeting_link,
    delete_session,
    get_session,
    get_user_sessions,
    find_overlaps_for_mentor
};
