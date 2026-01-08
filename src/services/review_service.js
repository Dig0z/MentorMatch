const review_repository = require('../repositories/review_repository.js');
const user_service = require('../services/user_service.js');

async function add_review(mentee_id, email, review) {
    const mentee_role = await user_service.get_role(mentee_id);
    if(mentee_role != 'mentee') {
        const err = new Error('This function is for mentees only');
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

async function get_reviews(email) {
    const {mentor_email} = email;
    const mentor_id = await user_service.get_id_from_email(mentor_email);
    if(!mentor_id) {
        const err = new Error('User not found');
        err.status = 404;
        throw err;
    }
    const reviews = await review_repository.get_reviews(mentor_id);
    if(reviews.length == 0) {
        const err = new Error('No review for this mentor');
        err.status = 404;
        throw err;
    }
    for(let i = 0; i < reviews.length; i++) {
        const {mentee_id} = reviews[i];
        const mentee_email = user_service.get_email_from_id(mentee_id);
        const {id, rating, comment} = reviews[i];
        reviews[i] = {id, mentee_email, rating, comment};
    }
    return reviews;
} 

async function delete_review(mentee_id, review_id) {
    const {id} = review_id;
    const role = await user_service.get_role(mentee_id);
    if(role != 'mentee') {
        const err = new Error('This function is for mentees only');
        err.status = 403;
        throw err;
    }
    console.log(mentee_id);
    const mentee = await review_repository.check_mentee_id(id);
    if(!mentee) {
        const err = new Error('Review not found');
        err.status = 404;
        throw err;
    }
    const {mentee_id:check_mentee} = mentee;
    if(check_mentee != mentee_id) {
        const err = new Error('Review can only be deleted by writer');
        err.status = 403;
        throw err;
    }
    return await review_repository.delete_review(id);
}

module.exports = {
    add_review,
    get_reviews,
    delete_review
};