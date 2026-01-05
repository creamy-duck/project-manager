/**
 * Hierarchical error codes for the application
 *
 * Naming convention: error.<category>.<resource?>.<action?>.<field?>
 * Categories: validation, auth, authz, resource, request, server
 */

const ErrorCodes = {
    // ============================================
    // VALIDATION ERRORS (400)
    // ============================================
    VALIDATION: {
        FAILED: {
            code: 'error.validation.failed',
            message: 'Validation failed',
            statusCode: 400
        },

        // Auth - Login
        LOGIN: {
            EMAIL_REQUIRED: {
                code: 'error.validation.auth.login.email_required',
                message: 'Email is required',
                statusCode: 400
            },
            EMAIL_INVALID: {
                code: 'error.validation.auth.login.email_invalid',
                message: 'Please provide a valid email address',
                statusCode: 400
            },
            PASSWORD_REQUIRED: {
                code: 'error.validation.auth.login.password_required',
                message: 'Password is required',
                statusCode: 400
            }
        },

        // Auth - Register
        REGISTER: {
            EMAIL_REQUIRED: {
                code: 'error.validation.auth.register.email_required',
                message: 'Email is required',
                statusCode: 400
            },
            EMAIL_INVALID: {
                code: 'error.validation.auth.register.email_invalid',
                message: 'Please provide a valid email address',
                statusCode: 400
            },
            PASSWORD_REQUIRED: {
                code: 'error.validation.auth.register.password_required',
                message: 'Password is required',
                statusCode: 400
            },
            PASSWORD_TOO_SHORT: {
                code: 'error.validation.auth.register.password_too_short',
                message: 'Password must be at least 8 characters long',
                statusCode: 400
            },
            PASSWORD_WEAK: {
                code: 'error.validation.auth.register.password_weak',
                message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                statusCode: 400
            },
            USERNAME_REQUIRED: {
                code: 'error.validation.auth.register.username_required',
                message: 'Username is required',
                statusCode: 400
            },
            USERNAME_LENGTH: {
                code: 'error.validation.auth.register.username_length',
                message: 'Username must be between 2 and 50 characters',
                statusCode: 400
            },
            USERNAME_FORMAT: {
                code: 'error.validation.auth.register.username_format',
                message: 'Username can only contain letters and spaces',
                statusCode: 400
            }
        },

        // User resource
        USER: {
            ID_INVALID: {
                code: 'error.validation.user.id_invalid',
                message: 'Invalid user ID format',
                statusCode: 400
            },
            EMAIL_INVALID: {
                code: 'error.validation.user.email_invalid',
                message: 'Please provide a valid email address',
                statusCode: 400
            },
            NAME_REQUIRED: {
                code: 'error.validation.user.name_required',
                message: 'Name is required',
                statusCode: 400
            },
            NAME_LENGTH: {
                code: 'error.validation.user.name_length',
                message: 'Name must be between 2 and 50 characters',
                statusCode: 400
            }
        }
    },

    // ============================================
    // AUTHENTICATION ERRORS (401)
    // ============================================
    AUTH: {
        INVALID_CREDENTIALS: {
            code: 'error.auth.invalid_credentials',
            message: 'Invalid email or password',
            statusCode: 401
        },
        TOKEN_MISSING: {
            code: 'error.auth.token_missing',
            message: 'Access denied. No token provided',
            statusCode: 401
        },
        TOKEN_INVALID: {
            code: 'error.auth.token_invalid',
            message: 'Invalid token. Please log in again',
            statusCode: 401
        },
        TOKEN_EXPIRED: {
            code: 'error.auth.token_expired',
            message: 'Your token has expired. Please log in again',
            statusCode: 401
        },
        TOKEN_MALFORMED: {
            code: 'error.auth.token_malformed',
            message: 'Malformed token. Please log in again',
            statusCode: 401
        },
        USER_NOT_FOUND: {
            code: 'error.auth.user_not_found',
            message: 'User associated with token not found',
            statusCode: 401
        }
    },

    // ============================================
    // AUTHORIZATION ERRORS (403)
    // ============================================
    AUTHZ: {
        ACCOUNT_DISABLED: {
            code: 'error.authz.account_disabled',
            message: 'User account is disabled',
            statusCode: 403
        },
        EMAIL_NOT_VERIFIED: {
            code: 'error.authz.email_not_verified',
            message: 'Email not verified',
            statusCode: 403
        },
        NO_ROLES: {
            code: 'error.authz.no_roles',
            message: 'No roles assigned to user',
            statusCode: 403
        },
        PERMISSION_DENIED: {
            code: 'error.authz.permission_denied',
            message: 'You do not have permission to perform this action',
            statusCode: 403
        }
    },

    // ============================================
    // RESOURCE ERRORS (404, 409)
    // ============================================
    RESOURCE: {
        NOT_FOUND: {
            code: 'error.resource.not_found',
            message: 'Resource not found',
            statusCode: 404
        },
        USER: {
            NOT_FOUND: {
                code: 'error.resource.user.not_found',
                message: 'User not found',
                statusCode: 404
            },
            EMAIL_EXISTS: {
                code: 'error.resource.user.email_exists',
                message: 'Email is already taken',
                statusCode: 409
            },
            USERNAME_EXISTS: {
                code: 'error.resource.user.username_exists',
                message: 'Username is already taken',
                statusCode: 409
            }
        }
    },

    // ============================================
    // REQUEST ERRORS (400)
    // ============================================
    REQUEST: {
        INVALID_JSON: {
            code: 'error.request.invalid_json',
            message: 'Invalid JSON payload',
            statusCode: 400
        },
        FILE_TOO_LARGE: {
            code: 'error.request.file_too_large',
            message: 'File size exceeds the allowed limit',
            statusCode: 400
        },
        FILE_UPLOAD_ERROR: {
            code: 'error.request.file_upload_error',
            message: 'File upload error',
            statusCode: 400
        }
    },

    // ============================================
    // SERVER ERRORS (500)
    // ============================================
    SERVER: {
        INTERNAL: {
            code: 'error.server.internal',
            message: 'An unexpected error occurred',
            statusCode: 500
        },
        DATABASE: {
            code: 'error.server.database',
            message: 'Database operation failed',
            statusCode: 500
        }
    }
};

module.exports = ErrorCodes;
