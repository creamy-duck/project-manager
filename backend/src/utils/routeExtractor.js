// Common API prefixes to test for nested router path detection
const COMMON_PREFIXES = [
    '/api/v1/users',
    '/api/v1/roles',
    '/api/v1/permissions',
    '/api/v1/projects',
    '/api/v1/tasks',
    '/api/v1/auth',
    '/api/v2/users',
    '/api/v2/roles',
    '/api/users',
    '/api/roles',
    '/api-docs',
    '/users',
    '/roles',
    '/auth',
    '/'
];

const extractPathFromMatchers = (matchers) => {
    if (!matchers || !matchers.length) return null;

    for (const testPath of COMMON_PREFIXES) {
        for (const matcher of matchers) {
            try {
                const result = matcher(testPath);
                if (result && result.path) {
                    return result.path;
                }
            } catch (e) {
            }
        }
    }
    return null;
};

const extractRoutes = (app) => {
    const routes = [];

    const router = app.router || app._router;

    if (!router || !router.stack) {
        return routes;
    }

    const processStack = (stack, basePath = '') => {
        stack.forEach(layer => {
            if (layer.route) {
                const routePath = basePath + layer.route.path;
                const methods = Object.keys(layer.route.methods)
                    .filter(method => layer.route.methods[method]);

                methods.forEach(method => {
                    routes.push({
                        path: normalizePath(routePath),
                        method: method.toUpperCase()
                    });
                });
            } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
                let routerPath = '';

                if (layer.matchers) {
                    routerPath = extractPathFromMatchers(layer.matchers) || '';
                } else if (layer.regexp) {
                    routerPath = extractPathFromRegex(layer.regexp);
                }

                processStack(layer.handle.stack, routerPath);
            }
        });
    };

    processStack(router.stack);
    return routes;
};

const extractPathFromRegex = (regexp) => {
    if (!regexp) return '';

    const regexStr = regexp.toString();

    if (regexStr === '/^\\/?(?=\\/|$)/i') {
        return '';
    }

    let path = regexp.source
        .replace(/^\^/, '')
        .replace(/\\\/\?\(\?\=.*$/, '')
        .replace(/\(\?:\(\[\^\\\/\]\+\?\)\)/g, ':param')
        .replace(/\\\//g, '/')
        .replace(/\?\(\?\=.*\)$/i, '')
        .replace(/\/\?$/, '')
        .replace(/\$$/, '');

    return path || '';
};

const normalizePath = (path) => {
    if (!path) return '/';

    let normalized = path.replace(/\/+/g, '/');

    if (!normalized.startsWith('/')) {
        normalized = '/' + normalized;
    }

    if (normalized.length > 1 && normalized.endsWith('/')) {
        normalized = normalized.slice(0, -1);
    }

    return normalized;
};

const generatePermissionName = (method, path) => {
    const normalized = normalizePath(path);

    let parts = normalized
        .replace(/^\/api\/v\d+\//, '')  // Remove /api/v1/ prefix
        .replace(/^\//, '')              // Remove leading slash
        .split('/')
        .filter(p => p);                 // Remove empty parts

    parts = parts.map(part => {
        if (part.startsWith(':')) {
            return 'id';
        }
        return part;
    });

    const resource = parts.join('.');
    const methodLower = method.toLowerCase();

    if (!resource) {
        return `${methodLower}.root`;
    }

    return `${methodLower}.${resource}`;
};

const generatePermissionDescription = (method, path) => {
    const normalized = normalizePath(path);
    const parts = normalized
        .replace(/^\/api\/v\d+\//, '')
        .replace(/^\//, '')
        .split('/')
        .filter(p => p);

    const resource = parts[0] || 'root';
    const hasId = parts.some(p => p.startsWith(':'));
    const subResource = parts.length > 1 && !parts[1].startsWith(':') ? parts[1] : null;

    const descriptions = {
        GET: hasId ? `Get ${resource} by ID` : (subResource ? `Get ${subResource} for ${resource}` : `List all ${resource}`),
        POST: `Create new ${resource}`,
        PUT: `Update ${resource}`,
        PATCH: `Partially update ${resource}`,
        DELETE: `Delete ${resource}`
    };

    return descriptions[method.toUpperCase()] || `${method} ${path}`;
};

module.exports = {
    extractRoutes,
    generatePermissionName,
    generatePermissionDescription,
    normalizePath
};
