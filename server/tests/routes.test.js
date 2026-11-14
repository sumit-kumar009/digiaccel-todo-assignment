const request = require('supertest');
const mongoose = require('mongoose');
const Task = require('../src/models/Task');
const createApp = require('../src/app');

// The database layer is mocked so these tests only check the HTTP behaviour.
const app = createApp();
const id = new mongoose.Types.ObjectId().toString();

function fakeTask(overrides = {}) {
  const doc = new Task({ title: 'Test', dueDate: new Date('2026-11-14T10:00:00Z'), ...overrides });
  jest.spyOn(doc, 'save').mockResolvedValue(doc);
  jest.spyOn(doc, 'deleteOne').mockResolvedValue({});
  return doc;
}

afterEach(() => jest.restoreAllMocks());

describe('GET /api/tasks', () => {
  test('builds a case-insensitive search across title and description', async () => {
    const find = jest.spyOn(Task, 'find').mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });

    await request(app).get('/api/tasks?search=cat.food').expect(200);

    const filter = find.mock.calls[0][0];
    expect(filter.$or).toHaveLength(2);
    expect(filter.$or[0].title.test('Buy CAT.FOOD')).toBe(true);
    expect(filter.$or[0].title.test('catXfood')).toBe(false);
  });

  test('applies a date range', async () => {
    const find = jest.spyOn(Task, 'find').mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    await request(app).get('/api/tasks?from=2026-11-09&to=2026-11-16').expect(200);
    expect(find.mock.calls[0][0].dueDate.$gte).toEqual(new Date('2026-11-09'));
  });

  test('rejects an invalid date range', async () => {
    await request(app).get('/api/tasks?from=nope').expect(400);
  });
});

describe('GET /api/tasks/weeks', () => {
  test('returns open/completed counts per week', async () => {
    const weekStart = new Date('2026-11-09T00:00:00Z');
    const agg = jest.spyOn(Task, 'aggregate').mockResolvedValue([{ _id: weekStart, total: 5, completed: 2 }]);

    const res = await request(app).get('/api/tasks/weeks?tz=Asia/Kolkata').expect(200);

    expect(res.body).toEqual([{ weekStart: weekStart.toISOString(), total: 5, completed: 2, open: 3 }]);
    const trunc = agg.mock.calls[0][0][0].$group._id.$dateTrunc;
    expect(trunc).toMatchObject({ unit: 'week', startOfWeek: 'monday', timezone: 'Asia/Kolkata' });
  });

  test('rejects an invalid time zone', async () => {
    await request(app).get('/api/tasks/weeks?tz=Mars/Base').expect(400);
  });
});

describe('POST /api/tasks', () => {
  test('creates a task', async () => {
    jest.spyOn(Task, 'create').mockImplementation(async (data) => new Task(data));
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Homework', dueDate: '2026-11-14T10:00:00Z', priority: 'High' })
      .expect(201);
    expect(res.body).toMatchObject({ title: 'Homework', priority: 'High', status: 'In Progress' });
    expect(res.body.id).toBeDefined();
  });

  test('returns field errors for invalid input', async () => {
    const res = await request(app).post('/api/tasks').send({ title: '' }).expect(400);
    expect(res.body.errors).toHaveProperty('title');
    expect(res.body.errors).toHaveProperty('dueDate');
  });

  test('handles malformed JSON', async () => {
    await request(app).post('/api/tasks').set('Content-Type', 'application/json').send('{bad').expect(400);
  });
});

describe('single task routes', () => {
  test('404 for an invalid id', async () => {
    await request(app).get('/api/tasks/not-an-id').expect(404);
  });

  test('404 when the task does not exist', async () => {
    jest.spyOn(Task, 'findById').mockResolvedValue(null);
    await request(app).get(`/api/tasks/${id}`).expect(404);
  });

  test('PUT updates allowed fields', async () => {
    const doc = fakeTask();
    jest.spyOn(Task, 'findById').mockResolvedValue(doc);
    const res = await request(app).put(`/api/tasks/${id}`).send({ title: 'Renamed', status: 'Completed' }).expect(200);
    expect(res.body.title).toBe('Renamed');
    expect(res.body.status).toBe('In Progress'); // status is only changed via PATCH /status
  });

  test('PATCH status marks a task completed', async () => {
    const doc = fakeTask();
    jest.spyOn(Task, 'findById').mockResolvedValue(doc);
    const res = await request(app).patch(`/api/tasks/${id}/status`).send({ status: 'Completed' }).expect(200);
    expect(res.body.status).toBe('Completed');
  });

  test('PATCH status rejects unknown values', async () => {
    jest.spyOn(Task, 'findById').mockResolvedValue(fakeTask());
    await request(app).patch(`/api/tasks/${id}/status`).send({ status: 'Done' }).expect(400);
  });

  test('DELETE removes a task', async () => {
    const doc = fakeTask();
    jest.spyOn(Task, 'findById').mockResolvedValue(doc);
    await request(app).delete(`/api/tasks/${id}`).expect(204);
    expect(doc.deleteOne).toHaveBeenCalled();
  });
});

test('unknown routes return 404 JSON', async () => {
  const res = await request(app).get('/api/nope').expect(404);
  expect(res.body.message).toMatch(/not found/);
});
