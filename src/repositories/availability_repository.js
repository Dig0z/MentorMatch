const path = require('path');
const {pool} = require(path.resolve(__dirname, '..', 'config', 'db.js'));

async function add_availability(mentor_id, weekday, start_time, end_time) {
    const query = `
        INSERT INTO mentor_availability(mentor_id, weekday, start_time, end_time)
        VALUES($1, $2, $3, $4)
        RETURNING *
    `;
    const values = [mentor_id, weekday, start_time, end_time];
    const result = await pool.query(query, values);
    return result.rows[0];
};

module.exports = {
    add_availability
}