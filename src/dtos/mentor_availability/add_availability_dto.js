const add_availability_dto = {
    weekday: {
        required: true,
        type: 'number',
        min: 1,
        max: 7        
    },
    start_time: {
        required: true,
        pattern: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}(:?\d{2})?)?$/
    },
    end_time: {
        required: true,
        pattern: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}(:?\d{2})?)?$/
    }
};

module.exports = add_availability_dto;