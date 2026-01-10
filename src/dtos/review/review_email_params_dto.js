const review_params_dto = {
    mentor_email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }
};

module.exports = review_params_dto;