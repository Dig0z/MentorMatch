const path = require('path');
const {pool} = require(path.resolve(__dirname, '..', 'config', 'db.js'));

async function send_notification(user_id, message) {
    const query = `
        INSERT INTO notifications(user_id, message)
        VALUES ($1, $2)
        RETURNING user_id, message
    `;
    const result = await pool.query(query, [user_id, message]);
    return result.rows[0];
}

async function fetch_notifications(user_id) {
    const query = `
        SELECT message
        FROM notifications
        WHERE user_id = $1
    `;
    const result = await pool.query(query, [user_id]);
    return result.rows;
}

module.exports = {
    send_notification,
    fetch_notifications
}