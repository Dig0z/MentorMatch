const availability_repository = require('../repositories/availability_repository');

async function add_availability(mentor_id, payload) {
    const {weekday, start_time, end_time} = payload;
    const dates = await availability_repository.check_availability(mentor_id, weekday);
    if(dates && check_date(dates, weekday, start_time)) {
        const err = new Error('Please do not overlap availabilities');
        err.status(400);
        throw err;
    }
    const result = await availability_repository.add_availability(mentor_id, weekday, start_time, end_time);
    if(!result) {
        const err = new Error('Failed to add availability');
        err.status(500);
        throw err;
    }
    return result;
};

async function get_availabilities(mentor_id) {
    const dates = await availability_repository.get_availabilities(mentor_id);
    if(!dates) {
        dates = 'No availability found';
    }
    return dates;
};

async function remove_availability(id, mentor_id) {
    const date = availability_repository.remove_availability(id, mentor_id);
    if(!date) {
        const err = new Error('Availability not found');
        err.status(404);
        throw err;
    }
    return date;
}

async function remove_all(mentor_id) {
    const dates = availability_repository.remove_all(mentor_id);
    if(!dates) {
        dates = 'No date to remove';
    }
    return dates; 
}

function check_date(dates, new_start_time) {
    for(i in dates) {
        const {id, weekday, start_time, end_time} = i;
        const old_end_hour = Number(end_time.split(':')[0]);
        const old_end_minute = Number(end_time.split(':')[1]);
        const new_start_hour = Number(new_start_time.split(':')[0]);
        const new_start_minute = Number(new_start_time.split(':')[1]);
        if(new_start_hour < old_end_hour || (new_start_hour == old_end_hour && new_start_minute <= old_end_minute)) {
            return false;
        }
    }
    return true;
}

module.exports = {
    add_availability,
    get_availabilities,
    remove_availability,
    remove_all
};