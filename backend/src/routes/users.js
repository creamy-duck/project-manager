const express = require('express');
const { authorize } = require('../middleware/authorize');
const { authenticate } = require('../middleware/authenticate');
const userController = require('../controllers/userController');

const router = express.Router();

// GET /api/v1/users - List all users
router.get('/', authorize(), userController.getAll);

// GET /api/v1/users/me - Get current authenticated user
router.get('/me', authenticate, userController.getMe);

// GET /api/v1/users/:id - Get user by ID
router.get('/:id', authorize(), userController.getById);

// POST /api/v1/users - Create new user
router.post('/', authorize(), userController.create);

// PUT /api/v1/users/:id - Update user
router.put('/:id', authorize(), userController.update);

// DELETE /api/v1/users/:id - Delete user
router.delete('/:id', authorize(), userController.delete);

module.exports = router;
