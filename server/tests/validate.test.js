const { parseTaskInput, parseStatus, escapeRegex, isValidTimeZone } = require('../src/utils/validate');

describe('parseTaskInput', () => {
  const valid = { title: 'Buy milk', dueDate: '2026-11-14T10:00:00.000Z' };

  test('accepts a minimal valid task', () => {
    expect(parseTaskInput(valid)).toEqual(valid);
  });

  test('requires title and dueDate on create', () => {
    try {
      parseTaskInput({});
      throw new Error('should have thrown');
    } catch (err) {
      expect(err.status).toBe(400);
      expect(err.details).toHaveProperty('title');
      expect(err.details).toHaveProperty('dueDate');
    }
  });

  test('rejects blank title', () => {
    expect(() => parseTaskInput({ ...valid, title: '   ' })).toThrow('Validation failed');
  });

  test('rejects unknown priority', () => {
    expect(() => parseTaskInput({ ...valid, priority: 'Urgent' })).toThrow('Validation failed');
  });

  test('rejects end time before start time', () => {
    expect(() => parseTaskInput({ ...valid, endDate: '2026-11-14T09:00:00.000Z' })).toThrow(
      'Validation failed'
    );
  });

  test('strips fields that clients are not allowed to set', () => {
    const data = parseTaskInput({ ...valid, status: 'Completed', _id: 'x', createdAt: 'y' });
    expect(data).toEqual(valid);
  });

  test('allows partial updates', () => {
    expect(parseTaskInput({ priority: 'High' }, { partial: true })).toEqual({ priority: 'High' });
  });

  test('clears priority and endDate with empty strings', () => {
    expect(parseTaskInput({ priority: '', endDate: '' }, { partial: true })).toEqual({
      priority: null,
      endDate: null,
    });
  });
});

describe('helpers', () => {
  test('parseStatus only accepts the two statuses', () => {
    expect(parseStatus({ status: 'Completed' })).toBe('Completed');
    expect(parseStatus({ status: 'In Progress' })).toBe('In Progress');
    expect(() => parseStatus({ status: 'Done' })).toThrow();
  });

  test('escapeRegex makes special characters literal', () => {
    expect(new RegExp(escapeRegex('a.b*(c)')).test('a.b*(c)')).toBe(true);
    expect(new RegExp(escapeRegex('a.b')).test('axb')).toBe(false);
  });

  test('isValidTimeZone', () => {
    expect(isValidTimeZone('Asia/Kolkata')).toBe(true);
    expect(isValidTimeZone('Not/AZone')).toBe(false);
  });
});
