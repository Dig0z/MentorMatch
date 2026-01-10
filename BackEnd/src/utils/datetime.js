function pad2(n) { return String(n).padStart(2, '0'); }

function formatLocalYMDHMS(dateInput) {
  if (!dateInput) return null;
  const d = (dateInput instanceof Date) ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mm = pad2(d.getMinutes());
  const ss = pad2(d.getSeconds());
  return `${y}-${m}-${dd}T${hh}:${mm}:${ss}`; // local, no Z
}

function normalizeSessionDateTimes(session) {
  if (!session) return session;
  return {
    ...session,
    start_datetime: formatLocalYMDHMS(session.start_datetime),
    end_datetime: formatLocalYMDHMS(session.end_datetime)
  };
}

function normalizeSessionArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(normalizeSessionDateTimes);
}

module.exports = { formatLocalYMDHMS, normalizeSessionDateTimes, normalizeSessionArray };
