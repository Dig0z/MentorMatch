const availability_repository = require('../repositories/availability_repository');
const user_service = require('../services/user_service');
const { parseTimeToMinutes, normalizeToHHMMSS, minutesToHHMMSS } = require('../utils/time');
const { parseDateYMD } = require('../utils/date');

const DEBUG = process.env.DEBUG_AVAILABILITY === 'true';
function debugLog(...args) { if (DEBUG) console.log('[AVAIL]', ...args); }

function httpError(status, message, details) {
    const err = new Error(message);
    err.status = status;
    if (details) err.details = details;
    return err;
}

function isContained(reqStart, reqEnd, availStart, availEnd) {
    return availStart <= reqStart && reqEnd <= availEnd;
}

async function add_availability(mentor_id, payload) {
    let {date, start_time, end_time} = payload;
    // Require date string YYYY-MM-DD for concrete per-day availability
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const err = new Error('date must be a string in format YYYY-MM-DD');
        err.status = 400;
        throw err;
    }
    // Validate date
    parseDateYMD(date);
    // Normalize times and validate
    const sHHMMSS = normalizeToHHMMSS(String(start_time));
    const eHHMMSS = normalizeToHHMMSS(String(end_time));
    const sMin = parseTimeToMinutes(sHHMMSS);
    const eMin = parseTimeToMinutes(eHHMMSS);
    if (sMin >= eMin) {
        const err = new Error('start_time must be strictly earlier than end_time');
        err.status = 400;
        throw err;
    }

    const dates = await availability_repository.check_availability(mentor_id, date);
    if(dates && check_date(dates, sHHMMSS, eHHMMSS)) {
        const err = new Error('Please do not overlap availabilities');
        err.status = 409;
        throw err;
    }
    const result = await availability_repository.add_availability(mentor_id, date, sHHMMSS, eHHMMSS);
    if(!result) {
        const err = new Error('Failed to add availability');
        err.status = 500;
        throw err;
    }
    return result;
};

async function get_availabilities(mentor_id) {
    const dates = await availability_repository.get_availabilities(mentor_id);
    return dates || [];
};

async function remove_availability(id_param, mentor_id) {
    const {id} = id_param;
    const date = availability_repository.remove_availability(id, mentor_id);
    if(!date) {
        const err = new Error('Availability not found');
        err.status = 404;
        throw err;
    }
    return date;
}

async function remove_all(mentor_id) {
    const dates = availability_repository.remove_all(mentor_id);
    if(!dates || dates.length == 0) {
        const err = new Error('No date found');
        err.status = 404;
        throw err;
    }
    return dates; 
}

// Verifies that the requested interval is fully contained in a single availability block for the specific DATE.
// Throws 409 with precise reason if not available; 400 for invalid input.
async function get_availability(mentor_id, dateStr, start_time, end_time) {
    if (!mentor_id) throw httpError(400, 'mentor_id is required');
    if (!dateStr) throw httpError(400, 'date is required (YYYY-MM-DD)');
    if (!start_time || !end_time) throw httpError(400, 'start_time and end_time are required');

    // Parse date safely (local time)
    parseDateYMD(String(dateStr));

    const reqStart = parseTimeToMinutes(String(start_time));
    const reqEnd = parseTimeToMinutes(String(end_time));
    if (reqStart >= reqEnd) throw httpError(400, 'start_time must be strictly earlier than end_time');

    const sHHMMSS = normalizeToHHMMSS(String(start_time));
    const eHHMMSS = normalizeToHHMMSS(String(end_time));

    // Fetch availability blocks by concrete date
    const blocks = await availability_repository.get_day_availabilities(mentor_id, dateStr);
    debugLog('Request', { mentor_id, dateStr, sHHMMSS, eHHMMSS, reqStart, reqEnd });
    debugLog('BlocksByDate', blocks);
    if (!blocks || blocks.length === 0) {
        throw httpError(409, `No availability defined for date ${dateStr}`);
    }

    const ok = blocks.some(b => {
        const aStart = parseTimeToMinutes(String(b.start_time));
        const aEnd = parseTimeToMinutes(String(b.end_time));
        return isContained(reqStart, reqEnd, aStart, aEnd);
    });

    if (!ok) {
        throw httpError(409, 'Requested interval not contained in any availability block', {
            date: dateStr,
            requested: { start_time: sHHMMSS, end_time: eHHMMSS },
            blocks
        });
    }

    return { ok: true };
}

function intervalsOverlap(aStartMin, aEndMin, bStartMin, bEndMin) {
    // Overlap for [aStart, aEnd) and [bStart, bEnd)
    return aStartMin < bEndMin && bStartMin < aEndMin;
}

function check_date(dates, new_start_time, new_end_time) {
    const ns = parseTimeToMinutes(normalizeToHHMMSS(String(new_start_time)));
    const ne = parseTimeToMinutes(normalizeToHHMMSS(String(new_end_time)));
    for (const d of dates) {
        const os = parseTimeToMinutes(normalizeToHHMMSS(String(d.start_time)));
        const oe = parseTimeToMinutes(normalizeToHHMMSS(String(d.end_time)));
        if (intervalsOverlap(ns, ne, os, oe)) return true;
    }
    return false;
}

module.exports = {
    add_availability,
    get_availabilities,
    remove_availability,
    remove_all,
    get_availability,
    // Helper for mentee viewing a mentor profile: fetch availabilities by email
    async get_availabilities_by_email(mentor_email) {
        const mentor_id = await user_service.get_id_from_email(mentor_email);
        return await get_availabilities(mentor_id);
    },
    // Consume a booked range from the mentor's availability by splitting/removing overlaps
    async consume_availability(mentor_id, dateStr, start_time, end_time) {
        // Assumes inputs validated upstream
        const sMin = parseTimeToMinutes(normalizeToHHMMSS(String(start_time)));
        const eMin = parseTimeToMinutes(normalizeToHHMMSS(String(end_time)));
        if (sMin >= eMin) return;
        const blocks = await availability_repository.get_day_availabilities(mentor_id, dateStr);
        if (!blocks || blocks.length === 0) return;
        for (const b of blocks) {
            const bStart = parseTimeToMinutes(String(b.start_time));
            const bEnd = parseTimeToMinutes(String(b.end_time));
            // overlap if [sMin,eMin) intersects [bStart,bEnd)
            if (sMin < bEnd && bStart < eMin) {
                // remove the original block
                await availability_repository.remove_availability(b.id, mentor_id);
                // left segment
                if (bStart < sMin) {
                    const leftStart = minutesToHHMMSS(bStart);
                    const leftEnd = minutesToHHMMSS(sMin);
                    await availability_repository.add_availability(mentor_id, dateStr, leftStart, leftEnd);
                }
                // right segment
                if (eMin < bEnd) {
                    const rightStart = minutesToHHMMSS(eMin);
                    const rightEnd = minutesToHHMMSS(bEnd);
                    await availability_repository.add_availability(mentor_id, dateStr, rightStart, rightEnd);
                }
            }
        }
    }
};