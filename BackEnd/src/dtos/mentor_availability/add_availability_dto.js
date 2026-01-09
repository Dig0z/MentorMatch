const add_availability_dto = {
    date: { 
        required: true,
        // Require a concrete date string YYYY-MM-DD
        pattern: /^\d{4}-\d{2}-\d{2}$/
    },
    start_time: {
        required: true,
        type: 'time',
        pattern: /^\d{2}:\d{2}$/ //TIME (HH:MM)
    },
    end_time: {
        required: true,
        type: 'time',
        pattern: /^\d{2}:\d{2}$/   //TIME (HH:MM)
    }
};

module.exports = add_availability_dto;