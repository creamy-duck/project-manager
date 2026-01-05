const Permission = require('../models/Permissions');
const {
    extractRoutes,
    generatePermissionName,
    generatePermissionDescription
} = require('../utils/routeExtractor');
const { logger } = require('../middleware/logger');

const syncPermissions = async (app) => {
    const results = {
        created: [],
        deleted: [],
        unchanged: [],
        errors: []
    };

    try {
        const routes = extractRoutes(app);

        logger.info('Starting permission sync...', {
            routesFound: routes.length
        });

        const routePermissions = routes.map(route => ({
            name: generatePermissionName(route.method, route.path),
            description: generatePermissionDescription(route.method, route.path),
            endpoint: route.path,
            method: route.method
        }));

        const routePermissionNames = new Set(routePermissions.map(p => p.name));

        const existingPermissions = await Permission.find({});
        const existingByName = new Map(
            existingPermissions.map(p => [p.name, p])
        );

        for (const permData of routePermissions) {
            try {
                if (!existingByName.has(permData.name)) {
                    await Permission.create(permData);
                    results.created.push(permData.name);
                    logger.debug(`Created permission: ${permData.name}`);
                } else {
                    results.unchanged.push(permData.name);
                }
            } catch (err) {
                if (err.code === 11000) {
                    results.unchanged.push(permData.name);
                } else {
                    results.errors.push({ name: permData.name, error: err.message });
                    logger.error(`Error creating permission: ${permData.name}`, {
                        error: err.message
                    });
                }
            }
        }

        for (const [name, perm] of existingByName) {
            if (!routePermissionNames.has(name)) {
                try {
                    await Permission.findByIdAndDelete(perm._id);
                    results.deleted.push(name);
                    logger.debug(`Deleted stale permission: ${name}`);
                } catch (err) {
                    results.errors.push({ name, error: err.message });
                    logger.error(`Error deleting permission: ${name}`, {
                        error: err.message
                    });
                }
            }
        }

        logger.info('Permission sync completed', {
            created: results.created.length,
            deleted: results.deleted.length,
            unchanged: results.unchanged.length,
            errors: results.errors.length
        });

        return results;

    } catch (err) {
        logger.error('Permission sync failed', { error: err.message });
        throw err;
    }
};

module.exports = {
    syncPermissions
};
