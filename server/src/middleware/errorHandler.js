const mongoose = require('mongoose');

function notFound(req, res) {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Errors thrown on purpose by our own code
  if (err.status) {
    return res.status(err.status).json({ message: err.message, errors: err.details });
  }

  // Mongoose schema validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = {};
    for (const [field, e] of Object.entries(err.errors)) errors[field] = e.message;
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  // Invalid JSON body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body is not valid JSON' });
  }

  console.error(err);
  return res.status(500).json({ message: 'Something went wrong' });
}

module.exports = { notFound, errorHandler };
