const userService = require('../services/userService');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError, ErrorCodes } = require('../errors');

class UserController {
    getAll = asyncHandler(async (req, res) => {
        const { page, limit, role, isActive } = req.query;

        const options = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            role,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
        };

        const result = await userService.getAllUsers(options);

        return res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            ...result
        });
    });

    getById = asyncHandler(async (req, res) => {
        const { id } = req.params;

        const user = await userService.getUserById(id);

        return res.status(200).json({
            success: true,
            message: 'User retrieved successfully',
            user
        });
    });

    getMe = asyncHandler(async (req, res) => {
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError(ErrorCodes.AUTH.TOKEN_INVALID);
        }

        const user = await userService.getCurrentUser(userId);

        return res.status(200).json({
            success: true,
            message: 'Current user retrieved successfully',
            user
        });
    });

    create = asyncHandler(async (req, res) => {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            throw new AppError(ErrorCodes.VALIDATION.FAILED, {
                message: 'Name, email and password are required',
                details: [
                    ...(!name ? [{ field: 'name', message: 'Name is required' }] : []),
                    ...(!email ? [{ field: 'email', message: 'Email is required' }] : []),
                    ...(!password ? [{ field: 'password', message: 'Password is required' }] : [])
                ]
            });
        }

        const user = await userService.createUser({ name, email, password, role });

        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            user
        });
    });

    update = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, email, role, isActive } = req.body;

        const user = await userService.updateUser(id, { name, email, role, isActive });

        return res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user
        });
    });

    delete = asyncHandler(async (req, res) => {
        const { id } = req.params;

        await userService.deleteUser(id);

        return res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    });
}

module.exports = new UserController();
