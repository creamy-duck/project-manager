const express = require('express');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

// GET /api/v1/users - List all users
router.get('/', authorize(), (req, res) => {
    // TODO: Implement list users
    res.json({
        message: 'List all users',
        users: []
    });
});

// GET /api/v1/users/me - Get current authenticated user
router.get('/me', authorize(), (req, res) => {
    res.json({
        message: 'Current user endpoint',
        user: req.user || null
    });
});

// GET /api/v1/users/:id - Get user by ID
router.get('/:id', authorize(), (req, res) => {
    const { id } = req.params;
    // TODO: Implement get user by ID
    res.json({
        message: 'Get user by ID',
        userId: id
    });
});

// POST /api/v1/users - Create new user
router.post('/', authorize(), (req, res) => {
    // TODO: Implement create user
    res.status(201).json({
        message: 'User created',
        user: req.body
    });
});

// PUT /api/v1/users/:id - Update user
router.put('/:id', authorize(), (req, res) => {
    const { id } = req.params;
    // TODO: Implement update user
    res.json({
        message: 'User updated',
        userId: id,
        data: req.body
    });
});

// DELETE /api/v1/users/:id - Delete user
router.delete('/:id', authorize(), (req, res) => {
    const { id } = req.params;
    // TODO: Implement delete user
    res.json({
        message: 'User deleted',
        userId: id
    });
});

module.exports = router;
