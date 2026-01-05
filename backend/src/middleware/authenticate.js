const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError, ErrorCodes } = require('../errors');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError(ErrorCodes.AUTH.TOKEN_MISSING);
        }

        const token = authHeader.substring(7);

        const secret = process.env.JWT_SECRET || 'your-secret-key';
        const decoded = jwt.verify(token, secret);

        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            throw new AppError(ErrorCodes.AUTH.USER_NOT_FOUND);
        }

        if (!user.isActive) {
            throw new AppError(ErrorCodes.AUTHZ.ACCOUNT_DISABLED);
        }

        if (!user.isEmailVerified) {
            throw new AppError(ErrorCodes.AUTHZ.EMAIL_NOT_VERIFIED);
        }

        req.user = user;
        req.userId = user._id;
        req.userRole = user.role;

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { authenticate };
