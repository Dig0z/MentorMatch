const path = require('path');
const { pool } = require(path.resolve(__dirname, '..', 'config', 'db.js'));

async function add_review(mentor_id, mentee_id, rating, comment) {
    const query = `
        INSERT INTO reviews(mentor_id, mentee_id, rating, comment)
        VALUES($1, $2, $3, $4)
        RETURNING id, mentor_id, mentee_id, rating, comment, created_at
    `;
    const res = await pool.query(query, [mentor_id, mentee_id, rating, comment || null]);
    return res.rows[0];
}

async function get_reviews_by_mentor(mentor_id, last_id = 0, limit = 20) {
    const query = `
        SELECT r.id, r.mentor_id, r.mentee_id, r.rating, r.comment, r.created_at,
               u.name AS mentee_name, u.surname AS mentee_surname, u.email AS mentee_email
        FROM reviews r
        JOIN users u ON u.id = r.mentee_id
        WHERE r.mentor_id = $1 AND r.id > $2
        ORDER BY r.id
        LIMIT $3
    `;
    const res = await pool.query(query, [mentor_id, last_id, limit]);
    return res.rows;
}

module.exports = {
    add_review,
    get_reviews_by_mentor
};
