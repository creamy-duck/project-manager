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

router.get('/verify',
    authController.verifyToken
);

router.post('/verify-pin',
    authController.verifyPin);

module.exports = router;