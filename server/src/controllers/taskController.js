const mongoose = require('mongoose');
const Task = require('../models/Task');
const {
  HttpError,
  parseTaskInput,
  parseStatus,
  isValidTimeZone,
  escapeRegex,
  isValidDate,
} = require('../utils/validate');

async function findTaskOr404(id) {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, 'Task not found');
  const task = await Task.findById(id);
  if (!task) throw new HttpError(404, 'Task not found');
  return task;
}

// GET /api/tasks?search=&from=&to=&status=
async function listTasks(req, res) {
  const { search, from, to, status } = req.query;
  const filter = {};

  if (search && search.trim()) {
    const pattern = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [{ title: pattern }, { description: pattern }];
  }

  if (from || to) {
    if ((from && !isValidDate(from)) || (to && !isValidDate(to))) {
      throw new HttpError(400, '"from" and "to" must be valid dates');
    }
    filter.dueDate = {};
    if (from) filter.dueDate.$gte = new Date(from);
    if (to) filter.dueDate.$lt = new Date(to);
  }

  if (status) {
    filter.status = parseStatus({ status });
  }

  const tasks = await Task.find(filter).sort({ dueDate: 1, createdAt: 1 });
  res.json(tasks);
}

// GET /api/tasks/weeks?tz=Asia/Kolkata
// Groups tasks into Monday–Sunday weeks (in the user's time zone) with open/completed counts.
async function weeklySummary(req, res) {
  const tz = req.query.tz || 'UTC';
  if (!isValidTimeZone(tz)) throw new HttpError(400, 'Invalid time zone');

  const weeks = await Task.aggregate([
    {
      $group: {
        _id: {
          $dateTrunc: { date: '$dueDate', unit: 'week', startOfWeek: 'monday', timezone: tz },
        },
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json(
    weeks.map((w) => ({
      weekStart: w._id,
      total: w.total,
      completed: w.completed,
      open: w.total - w.completed,
    }))
  );
}

// GET /api/tasks/:id
async function getTask(req, res) {
  res.json(await findTaskOr404(req.params.id));
}

// POST /api/tasks
async function createTask(req, res) {
  const data = parseTaskInput(req.body);
  const task = await Task.create(data);
  res.status(201).json(task);
}

// PUT /api/tasks/:id  (any of title, description, dueDate, endDate, priority)
async function updateTask(req, res) {
  const task = await findTaskOr404(req.params.id);
  const data = parseTaskInput(req.body, { partial: true });
  task.set(data);
  await task.save();
  res.json(task);
}

// PATCH /api/tasks/:id/status  { status: 'Completed' | 'In Progress' }
async function updateStatus(req, res) {
  const task = await findTaskOr404(req.params.id);
  task.status = parseStatus(req.body);
  await task.save();
  res.json(task);
}

// DELETE /api/tasks/:id
async function deleteTask(req, res) {
  const task = await findTaskOr404(req.params.id);
  await task.deleteOne();
  res.status(204).end();
}

module.exports = {
  listTasks,
  weeklySummary,
  getTask,
  createTask,
  updateTask,
  updateStatus,
  deleteTask,
};
