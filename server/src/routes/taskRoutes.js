const { Router } = require('express');
const tasks = require('../controllers/taskController');

const router = Router();

router.get('/', tasks.listTasks);
router.get('/weeks', tasks.weeklySummary);
router.get('/:id', tasks.getTask);
router.post('/', tasks.createTask);
router.put('/:id', tasks.updateTask);
router.patch('/:id/status', tasks.updateStatus);
router.delete('/:id', tasks.deleteTask);

module.exports = router;
