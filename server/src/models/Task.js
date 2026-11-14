const mongoose = require('mongoose');

const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['In Progress', 'Completed'];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title can be at most 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description can be at most 1000 characters'],
    },
    // Date + start time of the task. This is what decides which week a task belongs to.
    dueDate: {
      type: Date,
      required: [true, 'Date & time is required'],
    },
    // Optional end time (the design has "Start" and "Ends" fields)
    endDate: {
      type: Date,
      default: null,
      validate: {
        validator(value) {
          if (!value || !this.dueDate) return true;
          return value >= this.dueDate;
        },
        message: 'End time must be after start time',
      },
    },
    priority: {
      type: String,
      enum: { values: PRIORITIES, message: 'Priority must be Low, Medium or High' },
      default: null,
    },
    status: {
      type: String,
      enum: { values: STATUSES, message: 'Status must be In Progress or Completed' },
      default: 'In Progress',
    },
  },
  { timestamps: true }
);

taskSchema.index({ dueDate: 1 });

taskSchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model('Task', taskSchema);
module.exports.PRIORITIES = PRIORITIES;
module.exports.STATUSES = STATUSES;
