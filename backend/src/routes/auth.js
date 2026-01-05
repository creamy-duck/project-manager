const express = require('express');
const { authorize } = require('../middleware/authorize');
const authController = require('../controllers/authController');
const { validateLogin, validateRegister } = require('../middleware/validation');

const router = express.Router();

// POST /api/v1/auth/login - User login
router.post('/login',
    validateLogin,
    authController.login
);

// POST /api/v1/auth/register - User registration
router.post('/register',
    validateRegister,
    authController.register
);

module.exports = router;