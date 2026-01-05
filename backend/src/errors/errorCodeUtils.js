const ErrorCodes = require('./errorCodes');

/**
 * Recursively flattens the ErrorCodes object into a flat array
 * @param {Object} obj - The object to flatten
 * @param {string} path - Current path in the hierarchy
 * @returns {Array} Array of error code objects with category path
 */
function flattenErrorCodes(obj = ErrorCodes, path = '') {
    const result = [];

    for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;

        // Check if this is an error definition (has code, message, statusCode)
        if (value && typeof value === 'object' && 'code' in value && 'message' in value && 'statusCode' in value) {
            result.push({
                category: currentPath,
                code: value.code,
                message: value.message,
                statusCode: value.statusCode
            });
        } else if (value && typeof value === 'object') {
            // Recurse into nested objects
            result.push(...flattenErrorCodes(value, currentPath));
        }
    }

    return result;
}

/**
 * Groups error codes by their HTTP status code
 * @returns {Object} Error codes grouped by status code
 */
function groupByStatusCode() {
    const codes = flattenErrorCodes();
    const grouped = {};

    for (const error of codes) {
        const status = error.statusCode;
        if (!grouped[status]) {
            grouped[status] = [];
        }
        grouped[status].push(error);
    }

    return grouped;
}

/**
 * Groups error codes by their top-level category
 * @returns {Object} Error codes grouped by category
 */
function groupByCategory() {
    const codes = flattenErrorCodes();
    const grouped = {};

    for (const error of codes) {
        const topCategory = error.category.split('.')[0];
        if (!grouped[topCategory]) {
            grouped[topCategory] = [];
        }
        grouped[topCategory].push(error);
    }

    return grouped;
}

/**
 * Generates markdown documentation for all error codes
 * @returns {string} Markdown formatted documentation
 */
function generateMarkdown() {
    const grouped = groupByCategory();
    let md = '# API Error Codes Reference\n\n';
    md += `> Auto-generated from \`errorCodes.js\` | Total: ${flattenErrorCodes().length} error codes\n\n`;
    md += '---\n\n';

    const categoryDescriptions = {
        VALIDATION: 'Input validation errors (HTTP 400)',
        AUTH: 'Authentication errors (HTTP 401)',
        AUTHZ: 'Authorization/permission errors (HTTP 403)',
        RESOURCE: 'Resource operation errors (HTTP 404, 409)',
        REQUEST: 'Request format errors (HTTP 400)',
        SERVER: 'Internal server errors (HTTP 500)'
    };

    for (const [category, errors] of Object.entries(grouped)) {
        md += `## ${category}\n\n`;
        if (categoryDescriptions[category]) {
            md += `${categoryDescriptions[category]}\n\n`;
        }
        md += '| Code | Message | HTTP Status |\n';
        md += '|------|---------|-------------|\n';

        for (const error of errors) {
            md += `| \`${error.code}\` | ${error.message} | ${error.statusCode} |\n`;
        }
        md += '\n';
    }

    md += '---\n\n';
    md += '## Response Format\n\n';
    md += '```json\n';
    md += '{\n';
    md += '  "success": false,\n';
    md += '  "error": {\n';
    md += '    "code": "error.auth.invalid_credentials",\n';
    md += '    "message": "Invalid email or password",\n';
    md += '    "details": { ... }\n';
    md += '  },\n';
    md += '  "timestamp": "2025-01-05T10:30:00.000Z",\n';
    md += '  "path": "/api/v1/auth/login"\n';
    md += '}\n';
    md += '```\n';

    return md;
}

module.exports = {
    flattenErrorCodes,
    groupByStatusCode,
    groupByCategory,
    generateMarkdown
};
