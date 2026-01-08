const book_session_dto = {
    mentor_email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    date: {
        required: true,
        pattern: /^\d{4}-\d{2}-\d{2}$/,
        type: 'date'
    },
    start_time: {
        required: true,
        pattern: /^\d{2}:\d{2}$/,
        type: 'time'
    },
    end_time: {
        required: true,
        pattern: /^\d{2}:\d{2}$/,
        type: 'time'
    }
};

module.exports = book_session_dto;