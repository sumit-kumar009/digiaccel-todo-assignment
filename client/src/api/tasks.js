const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors || {};
  }
}

async function request(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Could not reach the server. Check your connection.', 0);
  }

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(data?.message || 'Something went wrong', res.status, data?.errors);
  }
  return data;
}

function toQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const text = query.toString();
  return text ? `?${text}` : '';
}

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const tasksApi = {
  list: ({ search, from, to } = {}) =>
    request(`/tasks${toQuery({ search, from: from?.toISOString(), to: to?.toISOString() })}`),
  weeks: () => request(`/tasks/weeks${toQuery({ tz: timeZone })}`),
  create: (task) => request('/tasks', { method: 'POST', body: task }),
  update: (id, task) => request(`/tasks/${id}`, { method: 'PUT', body: task }),
  setStatus: (id, status) => request(`/tasks/${id}/status`, { method: 'PATCH', body: { status } }),
  remove: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
};
