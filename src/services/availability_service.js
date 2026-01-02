const availability_repository = require('../repositories/availability_repository');

async function add_availability(mentor_id, payload) {
    const {weekday, start_time, end_time} = payload;
    const result = await availability_repository.add_availability(mentor_id, weekday, start_time, end_time);
    if(!result) {
        const err = new Error('Failed to add availability');
        err.status(500);
        throw err;
    }
    return result;
}

module.exports = {
    add_availability
};