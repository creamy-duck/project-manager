const User = require('../models/User');
const bcrypt = require('bcrypt');
const { AppError, ErrorCodes } = require('../errors');

class UserService {
    async getAllUsers(options = {}) {
        const { page = 1, limit = 10, role, isActive } = options;

        const query = {};
        if (role) query.role = role;
        if (typeof isActive === 'boolean') query.isActive = isActive;

        const skip = (page - 1) * limit;

        const [users, totalCount] = await Promise.all([
            User.find(query)
                .select('-password -__v')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            User.countDocuments(query)
        ]);

        return {
            users,
            pagination: {
                current: page,
                total: Math.ceil(totalCount / limit),
                count: users.length,
                totalCount
            }
        };
    }

    async getUserById(id) {
        const user = await User.findById(id).select('-password -__v');

        if (!user) {
            throw new AppError(ErrorCodes.RESOURCE.USER.NOT_FOUND);
        }

        return user;
    }

    async getCurrentUser(userId) {
        return this.getUserById(userId);
    }

    async createUser(userData) {
        const { name, email, password, role } = userData;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new AppError(ErrorCodes.RESOURCE.USER.EMAIL_EXISTS);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'user'
        });

        await newUser.save();

        return this.sanitizeUser(newUser);
    }

    async updateUser(id, updateData) {
        const { name, email, role, isActive } = updateData;

        const user = await User.findById(id);
        if (!user) {
            throw new AppError(ErrorCodes.RESOURCE.USER.NOT_FOUND);
        }

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new AppError(ErrorCodes.RESOURCE.USER.EMAIL_EXISTS);
            }
        }

        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (role !== undefined) user.role = role;
        if (isActive !== undefined) user.isActive = isActive;

        await user.save();

        return this.sanitizeUser(user);
    }

    async deleteUser(id) {
        const user = await User.findById(id);

        if (!user) {
            throw new AppError(ErrorCodes.RESOURCE.USER.NOT_FOUND);
        }

        await User.findByIdAndDelete(id);

        return { id, deleted: true };
    }

    sanitizeUser(user) {
        const userObject = user.toJSON();
        delete userObject.password;
        delete userObject.__v;
        return userObject;
    }
}

module.exports = new UserService();
