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

async function update_status(id, mentor_id, mentee_id, status) {
    const query = `
        UPDATE sessions
        SET status = $1
        WHERE id = $2
        AND mentor_id = $3
        AND mentee_id = $4
        RETURNING id, start_datetime, end_datetime, status, meeting_link
    `;
    const result = await pool.query(query, [status, id, mentor_id, mentee_id]);
    return result.rows[0];
};

module.exports = {
    book_session,
    update_status
};