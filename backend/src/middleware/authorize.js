const Permission = require('../models/Permissions');
const Role = require('../models/Roles');
const User_Roles = require('../models/User_Roles');
const { generatePermissionName } = require('../utils/routeExtractor');

/**
 * Authorization middleware factory
 * Checks if the authenticated user has the required permission
 *
 * @param {string} [permissionName] - Specific permission to check (optional)
 *                                    If not provided, auto-generates from route
 * @returns {Function} Express middleware
 *
 * @example
 * // Auto-detect permission from route
 * router.get('/users', authorize(), listUsers);
 *
 * // Explicit permission
 * router.get('/users', authorize('get.users'), listUsers);
 */
const authorize = (permissionName = null) => {
    return async (req, res, next) => {
        try {
            // Check if user is authenticated
            if (!req.user || !req.user._id) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Authentication required'
                });
            }

            // Determine the required permission
            const requiredPermission = permissionName ||
                generatePermissionName(req.method, req.baseUrl + req.path);

            // Get user's roles
            const userRoles = await User_Roles.find({ userId: req.user._id })
                .populate('roleId');

            if (!userRoles || userRoles.length === 0) {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'No roles assigned to user'
                });
            }

            // Collect all permissions from user's roles
            const userPermissions = new Set();
            for (const userRole of userRoles) {
                if (userRole.roleId && userRole.roleId.permissions) {
                    userRole.roleId.permissions.forEach(perm => {
                        userPermissions.add(perm);
                    });
                }
            }

            // Check if user has the required permission
            if (userPermissions.has(requiredPermission)) {
                return next();
            }

            // Check for wildcard permissions (e.g., 'get.*' or '*.users')
            const [method, ...resourceParts] = requiredPermission.split('.');
            const resource = resourceParts.join('.');

            for (const perm of userPermissions) {
                // Check method wildcard: *.users
                if (perm === `*.${resource}`) {
                    return next();
                }
                // Check resource wildcard: get.*
                if (perm === `${method}.*`) {
                    return next();
                }
                // Check full wildcard: *.*
                if (perm === '*.*' || perm === '*') {
                    return next();
                }
            }

            // Permission denied
            return res.status(403).json({
                error: 'Forbidden',
                message: `Missing permission: ${requiredPermission}`
            });

        } catch (error) {
            console.error('Authorization error:', error);
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Authorization check failed'
            });
        }
    };
};

/**
 * Check if user has any of the specified permissions
 *
 * @param {string[]} permissions - Array of permission names
 * @returns {Function} Express middleware
 *
 * @example
 * router.get('/reports', authorizeAny(['get.reports', 'admin.reports']), getReports);
 */
const authorizeAny = (permissions) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user._id) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Authentication required'
                });
            }

            const userRoles = await User_Roles.find({ userId: req.user._id })
                .populate('roleId');

            const userPermissions = new Set();
            for (const userRole of userRoles) {
                if (userRole.roleId && userRole.roleId.permissions) {
                    userRole.roleId.permissions.forEach(perm => {
                        userPermissions.add(perm);
                    });
                }
            }

            // Check if user has any of the required permissions
            const hasPermission = permissions.some(perm => userPermissions.has(perm));

            if (hasPermission || userPermissions.has('*.*') || userPermissions.has('*')) {
                return next();
            }

            return res.status(403).json({
                error: 'Forbidden',
                message: `Missing one of permissions: ${permissions.join(', ')}`
            });

        } catch (error) {
            console.error('Authorization error:', error);
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Authorization check failed'
            });
        }
    };
};

/**
 * Check if user has all of the specified permissions
 *
 * @param {string[]} permissions - Array of permission names
 * @returns {Function} Express middleware
 */
const authorizeAll = (permissions) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user._id) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Authentication required'
                });
            }

            const userRoles = await User_Roles.find({ userId: req.user._id })
                .populate('roleId');

            const userPermissions = new Set();
            for (const userRole of userRoles) {
                if (userRole.roleId && userRole.roleId.permissions) {
                    userRole.roleId.permissions.forEach(perm => {
                        userPermissions.add(perm);
                    });
                }
            }

            // Super admin bypass
            if (userPermissions.has('*.*') || userPermissions.has('*')) {
                return next();
            }

            // Check if user has all required permissions
            const missingPermissions = permissions.filter(perm => !userPermissions.has(perm));

            if (missingPermissions.length === 0) {
                return next();
            }

            return res.status(403).json({
                error: 'Forbidden',
                message: `Missing permissions: ${missingPermissions.join(', ')}`
            });

        } catch (error) {
            console.error('Authorization error:', error);
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Authorization check failed'
            });
        }
    };
};

module.exports = {
    authorize,
    authorizeAny,
    authorizeAll
};
