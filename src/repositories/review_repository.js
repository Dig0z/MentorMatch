const {pool} = require('../config/db.js');
const { rating } = require('../dtos/review/add_review_body_dto.js');

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
    return result.rows;
}

async function get_reviews(mentor_id) {
    const query = `
        SELECT id, mentee_id, rating, comment
        FROM reviews
        WHERE mentor_id = $1
    `;
    const reviews = await pool.query(query, [mentor_id]);
    return reviews.rows;
}

module.exports = {
    add_review,
    check_double_review,
    get_reviews
};