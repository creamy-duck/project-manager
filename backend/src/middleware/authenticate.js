const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.substring(7);

        const secret = process.env.JWT_SECRET || 'your-secret-key';
        const decoded = jwt.verify(token, secret);

        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                message: 'User not found.'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                message: 'User account is disabled.'
            });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({
                message: 'Email not verified.'
            });
        }

        req.user = user;
        req.userId = user._id;
        req.userRole = user.role;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: 'Invalid token.'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Token expired.'
            });
        }

        console.error('Authentication error:', error);
        return res.status(500).json({
            message: 'Internal server error during authentication.'
        });
    }
};

module.exports = { authenticate };