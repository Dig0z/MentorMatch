const path = require('path');
const {pool} = require(path.resolve(__dirname, '..', 'config', 'db.js'));

async function add_availability(mentor_id, weekday, start_time, end_time) {
    const query = `
        INSERT INTO mentor_availability(mentor_id, weekday, start_time, end_time)
        VALUES($1, $2, $3, $4)
        RETURNING id, weekday, start_time, end_time
    `;
    const values = [mentor_id, weekday, start_time, end_time];
    const result = await pool.query(query, values);
    return result.rows[0];
};

async function check_availability(mentor_id, dateStr) {
    const query = `
        SELECT id, weekday, start_time, end_time
        FROM mentor_availability
        WHERE mentor_id = $1
        AND weekday = $2::date
    `;
    const availabilities = await pool.query(query, [mentor_id, dateStr]);
    return availabilities.rows;
}

async function get_availabilities(mentor_id) {
    const query = `
        SELECT id, weekday, start_time, end_time
        FROM mentor_availability
        WHERE mentor_id = $1
    `;
    const dates = await pool.query(query, [mentor_id]);  
    return dates.rows;
}

async function remove_availability(id, mentor_id) {
    const query = `
        DELETE
        FROM mentor_availability
        WHERE id = $1
        AND mentor_id = $2
        RETURNING id, weekday, start_time, end_time
    `;
    const old_availability = await pool.query(query, [id, mentor_id]);
    return old_availability.rows[0];
}

async function remove_all(mentor_id) {
    const query = `
        DELETE
        FROM mentor_availability
        WHERE mentor_id = $1
        RETURNING id, weekday, start_time, end_time
    `;
    const dates = await pool.query(query, [mentor_id]);
    return dates.rows;
}

async function get_availability(mentor_id, dateStr, start_time, end_time) {
    const query = `
        SELECT id
        FROM mentor_availability
        WHERE mentor_id = $1
        AND weekday = $2::date
        AND start_time <= $3::time
        AND end_time >= $4::time
    `;
    const availability = await pool.query(query, [mentor_id, dateStr, start_time, end_time]); 
    return availability.rows[0];
}

module.exports = {
    add_availability,
    check_availability,
    get_availabilities,
    remove_availability,
    remove_all,
    get_availability
}