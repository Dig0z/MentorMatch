const { parseTimeToMinutes, normalizeToHHMMSS } = require('../src/utils/time');
const { parseDateYMD, getWeekdayLocal } = require('../src/utils/date');

describe('time utils', () => {
  test('parse HH:MM', () => {
    expect(parseTimeToMinutes('00:00')).toBe(0);
    expect(parseTimeToMinutes('14:00')).toBe(14*60);
    expect(parseTimeToMinutes('23:59')).toBe(23*60+59);
  });
  test('parse HH:MM:SS', () => {
    expect(parseTimeToMinutes('01:30:00')).toBe(90);
    expect(normalizeToHHMMSS('14:00')).toBe('14:00:00');
    expect(normalizeToHHMMSS('14:00:30')).toBe('14:00:30');
  });
});

describe('date utils', () => {
  test('parse date YMD', () => {
    const { year, month, day, dateLocal } = parseDateYMD('2026-01-06');
    expect(year).toBe(2026);
    expect(month).toBe(1);
    expect(day).toBe(6);
    expect(dateLocal instanceof Date).toBe(true);
  });
  test('weekday mapping', () => {
    const { dateLocal } = parseDateYMD('2026-01-04'); // a Sunday
    const wk = getWeekdayLocal(dateLocal);
    expect(wk).toBeGreaterThanOrEqual(0);
    expect(wk).toBeLessThanOrEqual(6);
  });
});
