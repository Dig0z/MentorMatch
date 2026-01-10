module.exports = {
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    last_id: {
        type: 'number'
    },
    limit: {
        type: 'number'
    }
};
