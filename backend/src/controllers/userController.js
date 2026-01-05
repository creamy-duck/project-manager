const userService = require('../services/userService');

class UserController {
    getAll = async (req, res) => {
        try {
            const { page, limit, role, isActive } = req.query;

            const options = {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
                role,
                isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
            };

            const result = await userService.getAllUsers(options);

            return res.status(200).json({
                message: 'Users retrieved successfully',
                ...result
            });

        } catch (error) {
            console.error('Get all users error:', error.message);
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to retrieve users'
            });
        }
    };

    getById = async (req, res) => {
        try {
            const { id } = req.params;

            const user = await userService.getUserById(id);

            return res.status(200).json({
                message: 'User retrieved successfully',
                user
            });

        } catch (error) {
            console.error('Get user by ID error:', error.message);

            if (error.code === 'USER_NOT_FOUND') {
                return res.status(404).json({
                    error: 'Not Found',
                    message: error.message
                });
            }

            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to retrieve user'
            });
        }
    };

    getMe = async (req, res) => {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User not authenticated'
                });
            }

            const user = await userService.getCurrentUser(userId);

            return res.status(200).json({
                message: 'Current user retrieved successfully',
                user
            });

        } catch (error) {
            console.error('Get current user error:', error.message);

            if (error.code === 'USER_NOT_FOUND') {
                return res.status(404).json({
                    error: 'Not Found',
                    message: error.message
                });
            }

            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to retrieve current user'
            });
        }
    };

    create = async (req, res) => {
        try {
            const { name, email, password, role } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({
                    error: 'Validation failed',
                    message: 'Name, email and password are required'
                });
            }

            const user = await userService.createUser({ name, email, password, role });

            return res.status(201).json({
                message: 'User created successfully',
                user
            });

        } catch (error) {
            console.error('Create user error:', error.message);

            if (error.code === 'USER_EXISTS') {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: error.message
                });
            }

            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to create user'
            });
        }
    };

    update = async (req, res) => {
        try {
            const { id } = req.params;
            const { name, email, role, isActive } = req.body;

            const user = await userService.updateUser(id, { name, email, role, isActive });

            return res.status(200).json({
                message: 'User updated successfully',
                user
            });

        } catch (error) {
            console.error('Update user error:', error.message);

            if (error.code === 'USER_NOT_FOUND') {
                return res.status(404).json({
                    error: 'Not Found',
                    message: error.message
                });
            }

            if (error.code === 'EMAIL_EXISTS') {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: error.message
                });
            }

            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to update user'
            });
        }
    };

    delete = async (req, res) => {
        try {
            const { id } = req.params;

            await userService.deleteUser(id);

            return res.status(200).json({
                message: 'User deleted successfully'
            });

        } catch (error) {
            console.error('Delete user error:', error.message);

            if (error.code === 'USER_NOT_FOUND') {
                return res.status(404).json({
                    error: 'Not Found',
                    message: error.message
                });
            }

            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to delete user'
            });
        }
    };
}

module.exports = new UserController();
