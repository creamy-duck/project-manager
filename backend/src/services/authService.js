const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthService {
    async authenticateUser(email, password) {
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            const error = new Error('Invalid credentials');
            error.code = 'INVALID_CREDENTIALS';
            throw error;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            const error = new Error('Invalid credentials');
            error.code = 'INVALID_CREDENTIALS';
            throw error;
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
            const error = new Error('Username or email is already taken');
            error.code = 'USER_EXISTS';
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: username,
            email,
            password: hashedPassword
        });

        await newUser.save();

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
