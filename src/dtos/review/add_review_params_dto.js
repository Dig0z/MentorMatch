const add_review_params_dto = {
    mentor_email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }
};

module.exports = add_review_params_dto;