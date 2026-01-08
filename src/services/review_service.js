const review_repository = require('../repositories/review_repository.js');
const user_service = require('../services/user_service.js');

async function add_review(mentee_id, email, review) {
    const mentee_role = await user_service.get_role(mentee_id);
    if(mentee_role != 'mentee') {
        const err = new Error('This function is only for mentees');
        err.status = 403;
        throw err;
    }
    const {mentor_email} = email;
    const {rating, comment} = review;
    const mentor_id = await user_service.get_id_from_email(mentor_email);
    if(!mentor_id) {
        const err = new Error('User not found');
        err.status = 404;
        throw err;
    }
    const mentor_role = await user_service.get_role(mentor_id);
    if(mentor_role != 'mentor') {
        const err = new Error('Reviews must be about mentors');
        err.status = 403;
        throw err;
    }
    const check = await review_repository.check_double_review(mentee_id, mentor_id);
    if(check.length > 0) {
        const err = new Error('Cannot leave more than one review per mentor');
        err.status = 409;
        throw err;
    }
    const result = await review_repository.add_review(mentor_id, mentee_id, rating, comment);
    const {rating:rat, comment:com} = result;
    return {mentor_email, rating:rat, comment:com};
}

module.exports = {
    add_review
};