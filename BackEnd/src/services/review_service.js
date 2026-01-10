const user_repository = require('../repositories/user_repository');
const review_repository = require('../repositories/review_repository');

function httpError(status, message) {
    const err = new Error(message);
    err.status = status;
    return err;
}

async function add_review(mentee_id, payload) {
    const { mentor_email, rating, comment } = payload || {};
    if (!mentor_email || !mentor_email.includes('@')) {
        throw httpError(400, 'mentor_email is required');
    }
    const r = Number(rating);
    if (!Number.isInteger(r) || r < 1 || r > 5) {
        throw httpError(400, 'rating must be an integer between 1 and 5');
    }
    const mentor = await user_repository.get_id_from_email(mentor_email);
    if (!mentor?.id) throw httpError(404, 'Mentor not found');
    if (mentor.id === mentee_id) throw httpError(409, 'Cannot review yourself');
    const saved = await review_repository.add_review(mentor.id, mentee_id, r, comment || null);
    return saved;
}

async function get_reviews_by_email(mentor_email, last_id = 0, limit = 20) {
    const mentor = await user_repository.get_id_from_email(mentor_email);
    if (!mentor?.id) throw httpError(404, 'Mentor not found');
    return await review_repository.get_reviews_by_mentor(mentor.id, Number(last_id) || 0, Number(limit) || 20);
}

module.exports = {
    add_review,
    get_reviews_by_email
};
