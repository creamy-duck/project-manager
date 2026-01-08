const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { AppError, ErrorCodes } = require('../errors');
const MailService = require('./mailService');
const { MailTypes } = require('../mail/');

class AuthService {
    async authenticateUser(email, password) {
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            throw new AppError(ErrorCodes.AUTH.INVALID_CREDENTIALS);
        }

        if (!user.isActive) {
            throw new AppError(ErrorCodes.AUTHZ.ACCOUNT_DISABLED);
        }

        if (!user.isEmailVerified) {
            throw new AppError(ErrorCodes.AUTHZ.EMAIL_NOT_VERIFIED);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new AppError(ErrorCodes.AUTH.INVALID_CREDENTIALS);
        }

        const token = this.generateToken(user);
        const userObject = this.sanitizeUser(user);

        return { user: userObject, token };
    }

    async registerUser(username, email, password) {
        const existingUser = await User.findOne({
            $or: [{ name: username }, { email }]
        });

        if (existingUser) {
            const errorDef = existingUser.email === email
                ? ErrorCodes.RESOURCE.USER.EMAIL_EXISTS
                : ErrorCodes.RESOURCE.USER.USERNAME_EXISTS;
            throw new AppError(errorDef);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        let params = {
            username: username,
            loginUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
            year: new Date().getFullYear()
        }

        await MailService.createMail(newUser, MailTypes.AUTH.REGISTER, params);

        const token = this.generateToken(newUser);
        const userObject = this.sanitizeUser(newUser);

        return { user: userObject, token };
    }

    generateToken(user) {
        const payload = {
            id: user.id || user._id,
            name: user.name,
            role: user.role
        };

        const secret = process.env.JWT_SECRET || 'your-secret-key';
        const options = { expiresIn: '24h' };

        return jwt.sign(payload, secret, options);
    }

    sanitizeUser(user) {
        const userObject = user.toJSON();
        delete userObject.password;
        delete userObject.__v;
        return userObject;
    }
}

module.exports = new AuthService();
