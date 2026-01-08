const authService = require('../services/authService');
const asyncHandler = require('../middleware/asyncHandler');

class AuthController {
    login = asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        const { user, token } = await authService.authenticateUser(email, password);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user,
            token
        });
    });

    register = asyncHandler(async (req, res) => {
        const { username, email, password } = req.body;

        const { user, token } = await authService.registerUser(username, email, password);

        return res.status(201).json({
            success: true,
            message: 'Registration successful',
            user,
            token
        });
    });
}

module.exports = new AuthController();
