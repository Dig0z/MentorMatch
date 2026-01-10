const path = require('path');
const {pool} = require(path.resolve(__dirname, '..', 'config', 'db.js'));

let ensuredIsPaid = false;
async function ensureIsPaidColumn() {
    if (ensuredIsPaid) return;
    // Safe-guard: add column if it doesn't exist
    const sql = `ALTER TABLE mentor_availability ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE`;
    try { await pool.query(sql); } catch (e) { /* ignore */ }
    ensuredIsPaid = true;
}

async function add_availability(mentor_id, weekday, start_time, end_time, is_paid = false) {
    await ensureIsPaidColumn();
    const query = `
        INSERT INTO mentor_availability(mentor_id, weekday, start_time, end_time, is_paid)
        VALUES($1, $2, $3, $4, $5)
        RETURNING id, weekday, start_time, end_time, is_paid
    `;
    const values = [mentor_id, weekday, start_time, end_time, !!is_paid];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// NOTE: `weekday` column in DB stores a DATE (misnamed). We filter by concrete date.
async function check_availability(mentor_id, dateStr) {
    await ensureIsPaidColumn();
    const query = `
        SELECT id, weekday, start_time, end_time, is_paid
        FROM mentor_availability
        WHERE mentor_id = $1
        AND weekday = $2::date
    `;
    const availabilities = await pool.query(query, [mentor_id, dateStr]);
    return availabilities.rows;
}

async function get_availabilities(mentor_id) {
    await ensureIsPaidColumn();
    const query = `
        SELECT id, weekday, start_time, end_time, is_paid
        FROM mentor_availability
        WHERE mentor_id = $1
    `;
    const dates = await pool.query(query, [mentor_id]);  
    return dates.rows;
}

async function remove_availability(id, mentor_id) {
    await ensureIsPaidColumn();
    const query = `
        DELETE
        FROM mentor_availability
        WHERE id = $1
        AND mentor_id = $2
        RETURNING id, weekday, start_time, end_time, is_paid
    `;
    const old_availability = await pool.query(query, [id, mentor_id]);
    return old_availability.rows[0];
}

async function remove_all(mentor_id) {
    await ensureIsPaidColumn();
    const query = `
        DELETE
        FROM mentor_availability
        WHERE mentor_id = $1
        RETURNING id, weekday, start_time, end_time, is_paid
    `;
    const dates = await pool.query(query, [mentor_id]);
    return dates.rows;
}

async function get_availability(mentor_id, weekday, start_time, end_time) {
    await ensureIsPaidColumn();
    const query = `
        SELECT id
        FROM mentor_availability
        WHERE mentor_id = $1
        AND weekday = $2::date
        AND start_time <= $3::time
        AND end_time >= $4::time
    `;
    const availability = await pool.query(query, [mentor_id, weekday, start_time, end_time]); 
    return availability.rows[0];
}

async function get_day_availabilities(mentor_id, dateStr) {
    await ensureIsPaidColumn();
    const query = `
        SELECT id, weekday, start_time, end_time, is_paid
        FROM mentor_availability
        WHERE mentor_id = $1
        AND weekday = $2::date
        ORDER BY start_time ASC
    `;
    const result = await pool.query(query, [mentor_id, dateStr]);
    return result.rows;
}

module.exports = {
    add_availability,
    check_availability,
    get_availabilities,
    remove_availability,
    remove_all,
    get_availability,
    get_day_availabilities
}
