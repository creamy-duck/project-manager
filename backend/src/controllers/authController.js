const authService = require('../services/authService');
const asyncHandler = require('../middleware/asyncHandler');
const {AppError, ErrorCodes} = require("../errors");

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

    verifyToken = asyncHandler(async (req, res) => {
        const { code } = req.query;

        if (!code) {
            return res.status(400).send('<h1>Invalid verification link</h1><p>The verification link is invalid. Please check your email and try again.</p>');
        }

        const isValid = await authService.verifyToken(code);

        return res.status(200).json({
            success: true,
            message: isValid ? 'Token is valid' : 'Token is invalid',
            isValid
        });
    })

    verifyPin = asyncHandler(async (req, res) => {
        const { email, pin } = req.body;

        if (!email || !pin) {
            throw new AppError(ErrorCodes.VALIDATION.FAILED, {
                message: 'Email and PIN are required',
                details: [
                    ...(!email ? [{ field: 'email', message: 'Email is required' }] : []),
                    ...(!pin ? [{ field: 'pin', message: 'PIN is required' }] : [])
                ]
            });
        }

        const isValid = await authService.verifyPin(email, pin);

        return res.status(200).json({
            success: true,
            message: isValid ? 'PIN is valid' : 'PIN is invalid',
            isValid
        });
    });
}

module.exports = new AuthController();
