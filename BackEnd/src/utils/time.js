// Utilities for robust time parsing/comparison in minutes
// Accepts "HH:MM" or "HH:MM:SS" and returns integer minutes from midnight.
// Throws error with status 400 on invalid format/range.

function httpError(status, message, details) {
  const err = new Error(message);
  err.status = status;
  if (details) err.details = details;
  return err;
}

function parseTimeToMinutes(t) {
  if (typeof t !== 'string') throw httpError(400, 'Invalid time: must be a string');
  const parts = t.split(':');
  if (parts.length !== 2 && parts.length !== 3) {
    throw httpError(400, `Invalid time format: ${t}. Expected HH:MM or HH:MM:SS`);
  }
  const [hhStr, mmStr, ssStr = '0'] = parts;
  const hh = Number(hhStr), mm = Number(mmStr), ss = Number(ssStr);
  if (!Number.isInteger(hh) || !Number.isInteger(mm) || !Number.isInteger(ss)) {
    throw httpError(400, `Invalid time format: ${t}. Non-integer component`);
  }
  if (hh < 0 || hh > 23) throw httpError(400, `Hour out of range: ${hh}`);
  if (mm < 0 || mm > 59) throw httpError(400, `Minute out of range: ${mm}`);
  if (ss < 0 || ss > 59) throw httpError(400, `Second out of range: ${ss}`);
  return hh * 60 + mm + Math.floor(ss / 60);
}

function minutesToHHMMSS(min) {
  if (!Number.isFinite(min)) throw httpError(400, 'Invalid minutes value');
  const totalSeconds = Math.max(0, Math.round(min * 60));
  const hh = Math.floor(totalSeconds / 3600);
  const mm = Math.floor((totalSeconds % 3600) / 60);
  const ss = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hh % 24)}:${pad(mm)}:${pad(ss)}`;
}

function normalizeToHHMMSS(t) {
  // Returns HH:MM:SS for a given HH:MM or HH:MM:SS
  const parts = String(t).split(':');
  if (parts.length === 2) return `${parts[0]}:${parts[1]}:00`;
  if (parts.length === 3) return `${parts[0]}:${parts[1]}:${parts[2]}`;
  throw httpError(400, `Invalid time format: ${t}`);
}

module.exports = {
  parseTimeToMinutes,
  minutesToHHMMSS,
  normalizeToHHMMSS,
};