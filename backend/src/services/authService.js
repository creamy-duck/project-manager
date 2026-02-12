const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');
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
        const tokens = this.generateVerifyTokenForEmail();

        const userData = {
            name: username,
            email,
            password: hashedPassword,
            emailVerificationToken: tokens.code,
            emailVerificationPin: tokens.pin
        };

        const params = {
            username,
            loginUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
            year: new Date().getFullYear(),
            verifyUrl: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/v1/auth/verify?code=${tokens.code}&email=${encodeURIComponent(email)}`,
            pin: tokens.pin
        };

        const mailstatus = await MailService.createMail(userData, MailTypes.AUTH.REGISTER, params);

        if (!mailstatus) {
            throw new AppError(ErrorCodes.SERVER.EMAIL);
        }

        const newUser = await User.create(userData);

        const token = this.generateToken(newUser);
        const userObject = this.sanitizeUser(newUser);

        return { user: userObject, token };
    }

    generateVerifyTokenForEmail() {

        const code = crypto.randomBytes(50).toString('hex');
        const pin = this.generateSecurePin();

        return { code, pin };
    }

    generateSecurePin() {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        return (array[0] % 1_000_000).toString().padStart(6, "0");
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

    async verifyToken(token) {
        const user = await User.findOne({ emailVerificationToken: token });

        if (!user) {
            //throw new AppError(ErrorCodes.AUTH.VERIFY_TOKEN_INVALID);
            return false;
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationPin = undefined;

        await user.save();

        return this.sanitizeUser(user);
    }

    async verifyPin(email, pin) {
        const user = await User.findOne({ email, emailVerificationPin: pin });

        if (!user) {
            throw new AppError(ErrorCodes.AUTH.VERIFY_PIN_INVALID);
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationPin = undefined;

        await user.save();

        return this.sanitizeUser(user);
    }
}

module.exports = new AuthService();
