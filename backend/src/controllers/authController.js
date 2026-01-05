const authService = require('../services/authService');

class AuthController {
    login = async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    error: 'Validation failed',
                    message: 'Email and password are required'
                });
            }

            const { user, token } = await authService.authenticateUser(email, password);

            return res.status(200).json({
                message: 'Login successful',
                user,
                token
            });

        } catch (error) {
            console.error('Login error:', error.message);

            if (error.code === 'INVALID_CREDENTIALS') {
                return res.status(401).json({
                    error: 'Authentication failed',
                    message: error.message
                });
            }

            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Login failed'
            });
        }
    };

    register = async (req, res) => {
        try {
            const { username, email, password } = req.body;

            if (!username || !email || !password) {
                return res.status(400).json({
                    error: 'Validation failed',
                    message: 'Username, email and password are required'
                });
            }

            const { user, token } = await authService.registerUser(username, email, password);

            return res.status(201).json({
                message: 'Registration successful',
                user,
                token
            });

        } catch (error) {
            console.error('Registration error:', error.message);

            if (error.code === 'USER_EXISTS') {
                return res.status(400).json({
                    error: 'Registration failed',
                    message: error.message
                });
            }

            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Registration failed'
            });
        }
    };
}

module.exports = new AuthController();
