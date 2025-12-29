const get_mentors_dto = {
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    availability_day: {
        accepted_values: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    last_id: {
        type: 'number'
    },
    limit: {
        type: 'number'
    }
};

module.exports = get_mentors_dto;