// Utilities for safe date parsing and weekday mapping.
// Avoids timezone bugs by constructing Date(year, monthIndex, day) in local time.

function httpError(status, message, details) {
  const err = new Error(message);
  err.status = status;
  if (details) err.details = details;
  return err;
}

function parseDateYMD(dateStr) {
  if (typeof dateStr !== 'string') throw httpError(400, 'Invalid date: must be a string');
  const m = /^\d{4}-\d{2}-\d{2}$/.exec(dateStr);
  if (!m) throw httpError(400, `Invalid date format: ${dateStr}. Expected YYYY-MM-DD`);
  const [yStr, mStr, dStr] = [dateStr.slice(0,4), dateStr.slice(5,7), dateStr.slice(8,10)];
  const year = Number(yStr), month = Number(mStr), day = Number(dStr);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    throw httpError(400, `Invalid date components: ${dateStr}`);
  }
  // Create local date to avoid UTC shift
  const dateLocal = new Date(year, month - 1, day);
  if (dateLocal.getFullYear() !== year || (dateLocal.getMonth() + 1) !== month || dateLocal.getDate() !== day) {
    throw httpError(400, `Non-existent date: ${dateStr}`);
  }
  return { year, month, day, dateLocal };
}

// Convention: 0 = Sunday ... 6 = Saturday, to match JS Date.getDay()
// If DB uses a different convention, adjust mapping here consistently.
function getWeekdayLocal(dateLocal) {
  if (!(dateLocal instanceof Date)) throw httpError(400, 'Invalid Date object');
  return dateLocal.getDay();
}

module.exports = { parseDateYMD, getWeekdayLocal };