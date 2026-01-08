const availability_repository = require('../repositories/availability_repository');

async function add_availability(mentor_id, payload) {
    const {weekday, start_time, end_time} = payload;
    const dates = await availability_repository.check_availability(mentor_id, weekday);
    if(dates && check_date(dates, start_time)) {
        const err = new Error('Please do not overlap availabilities');
        err.status = 409;
        throw err;
    }
    const result = await availability_repository.add_availability(mentor_id, weekday, start_time, end_time);
    if(!result) {
        const err = new Error('Failed to add availability');
        err.status = 500;
        throw err;
    }
    console.log(`Added availability on ${weekday}, ${start_time} - ${end_time}`);
    return result;
};

async function get_availabilities(mentor_id) {
    const dates = await availability_repository.get_availabilities(mentor_id);
    if(!dates || dates.length == 0) {
        const err = new Error('No date found');
        err.status = 404;
        throw err;
    }
    console.log(`${dates.length} availabilities found`);
    return dates;
};

async function remove_availability(id_param, mentor_id) {
    const {id} = id_param;
    const date = availability_repository.remove_availability(id, mentor_id);
    const {weekday, start_time, end_time} = date;
    if(!date) {
        const err = new Error('Availability not found');
        err.status = 404;
        throw err;
    }
    console.log(`Availability on ${weekday}, ${start_time} - ${end_time} removed`);
    return date;
}

async function remove_all(mentor_id) {
    const dates = availability_repository.remove_all(mentor_id);
    if(!dates || dates.length == 0) {
        const err = new Error('No date found');
        err.status = 404;
        throw err;
    }
    console.log(`All dates removed`);
    return dates; 
}

async function get_availability(weekday, start_time, end_time) {
    const availability = await availability_repository.get_availability(weekday, start_time, end_time);
    if(!availability) {
        const err = new Error('Selected time is not available');
        err.status = 404;
        throw err;
    }
    return availability;
}

function check_date(dates, new_start_time) {
    for(i in dates) {
        const {end_time} = dates[i];
        const old_end_hour = Number(end_time.split(':')[0]);
        const old_end_minute = Number(end_time.split(':')[1]);
        const new_start_hour = Number(new_start_time.split(':')[0]);
        const new_start_minute = Number(new_start_time.split(':')[1]);
        if(new_start_hour < old_end_hour || (new_start_hour == old_end_hour && new_start_minute < old_end_minute)) {
            return true;
        }
    }
    return false;
}

module.exports = {
    add_availability,
    get_availabilities,
    remove_availability,
    remove_all,
    get_availability
};