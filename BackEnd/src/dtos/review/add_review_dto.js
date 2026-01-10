module.exports = {
    mentor_email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    rating: {
        required: true,
        type: 'number',
        min: 1,
        max: 5
    },
    comment: {
        max_length: 2000
    }
};
