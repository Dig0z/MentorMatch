const get_mentors_dto = {
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    availability_day: {
        type: 'date'
    },
    last_id: {
        type: 'number'
    },
    limit: {
        type: 'number'
    }
};

module.exports = get_mentors_dto;