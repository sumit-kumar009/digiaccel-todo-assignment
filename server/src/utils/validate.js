const { PRIORITIES, STATUSES } = require('../models/Task');

class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const EDITABLE_FIELDS = ['title', 'description', 'dueDate', 'endDate', 'priority'];

function isValidDate(value) {
  return !Number.isNaN(new Date(value).getTime());
}

// Picks only the fields a client is allowed to set and checks them.
// `partial` is used for updates where every field is optional.
function parseTaskInput(body = {}, { partial = false } = {}) {
  const errors = {};
  const data = {};

  for (const key of EDITABLE_FIELDS) {
    if (body[key] !== undefined) data[key] = body[key];
  }

  if (!partial || data.title !== undefined) {
    if (typeof data.title !== 'string' || !data.title.trim()) {
      errors.title = 'Title is required';
    }
  }

  if (data.description !== undefined && data.description !== null && typeof data.description !== 'string') {
    errors.description = 'Description must be text';
  }

  if (!partial || data.dueDate !== undefined) {
    if (!data.dueDate || !isValidDate(data.dueDate)) {
      errors.dueDate = 'A valid date & time is required';
    }
  }

  if (data.endDate !== undefined && data.endDate !== null && data.endDate !== '') {
    if (!isValidDate(data.endDate)) {
      errors.endDate = 'End time is not a valid date';
    } else if (data.dueDate && isValidDate(data.dueDate) && new Date(data.endDate) < new Date(data.dueDate)) {
      errors.endDate = 'End time must be after start time';
    }
  } else if (data.endDate === '') {
    data.endDate = null;
  }

  if (data.priority === '') data.priority = null;
  if (data.priority !== undefined && data.priority !== null && !PRIORITIES.includes(data.priority)) {
    errors.priority = 'Priority must be Low, Medium or High';
  }

  if (Object.keys(errors).length) {
    throw new HttpError(400, 'Validation failed', errors);
  }
  return data;
}

function parseStatus(body = {}) {
  if (!STATUSES.includes(body.status)) {
    throw new HttpError(400, 'Validation failed', { status: 'Status must be In Progress or Completed' });
  }
  return body.status;
}

function isValidTimeZone(tz) {
  try {
    Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

// Escape user text so it can be used safely inside a RegExp
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { HttpError, parseTaskInput, parseStatus, isValidTimeZone, escapeRegex, isValidDate };
