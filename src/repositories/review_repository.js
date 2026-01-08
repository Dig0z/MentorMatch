const {pool} = require('../config/db.js');

async function add_review(mentor_id, mentee_id, rating, comment) {
    const query = `
        INSERT INTO reviews(mentor_id, mentee_id, rating, comment)
        VALUES($1, $2, $3, $4)
        RETURNING rating, comment
    `;
    const values = [mentor_id, mentee_id, rating, comment];
    const result = await pool.query(query, values);
    return result.rows[0];
}

async function check_double_review(mentee_id, mentor_id) {
    const query = `
        SELECT id
        FROM reviews
        WHERE mentee_id = $1
        AND mentor_id = $2
    `;
    const result = await pool.query(query, [mentee_id, mentor_id]);
    console.log(result);
    console.log(result.rows);
    console.log(result.rows[0]);
    return result.rows;
}

module.exports = {
    add_review,
    check_double_review
};