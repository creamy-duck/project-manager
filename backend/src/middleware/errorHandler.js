const { logger } = require('./logger');
const { AppError, ErrorCodes } = require('../errors');

/**
 * Maps legacy error codes to new AppError format (backward compatibility)
 */
const legacyErrorMap = {
    'INVALID_CREDENTIALS': ErrorCodes.AUTH.INVALID_CREDENTIALS,
    'USER_EXISTS': ErrorCodes.RESOURCE.USER.EMAIL_EXISTS,
    'USER_NOT_FOUND': ErrorCodes.RESOURCE.USER.NOT_FOUND,
    'EMAIL_EXISTS': ErrorCodes.RESOURCE.USER.EMAIL_EXISTS
};

/**
 * Converts legacy errors to AppError format
 */
function convertLegacyError(err) {
    const errorDef = legacyErrorMap[err.code] || ErrorCodes.SERVER.INTERNAL;
    return new AppError(errorDef, { message: err.message });
}

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    let error = err;

    const logData = {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        error: err.message,
        stack: err.stack
    };

    // Convert known error types to AppError
    if (!(err instanceof AppError)) {
        // Mongoose CastError (invalid ObjectId)
        if (err.name === 'CastError') {
            error = new AppError(ErrorCodes.RESOURCE.NOT_FOUND);
        }
        // MongoDB duplicate key
        else if (err.code === 11000) {
            const field = Object.keys(err.keyPattern || {})[0];
            const errorDef = field === 'email'
                ? ErrorCodes.RESOURCE.USER.EMAIL_EXISTS
                : ErrorCodes.RESOURCE.USER.USERNAME_EXISTS;
            error = new AppError(errorDef, { details: { field } });
        }
        // Mongoose ValidationError
        else if (err.name === 'ValidationError') {
            const details = Object.values(err.errors).map(e => ({
                field: e.path,
                message: e.message
            }));
            error = new AppError(ErrorCodes.VALIDATION.FAILED, { details });
        }
        // JWT errors
        else if (err.name === 'JsonWebTokenError') {
            error = new AppError(ErrorCodes.AUTH.TOKEN_INVALID);
        }
        else if (err.name === 'TokenExpiredError') {
            error = new AppError(ErrorCodes.AUTH.TOKEN_EXPIRED);
        }
        // JSON parse error
        else if (err.name === 'SyntaxError' && err.status === 400 && 'body' in err) {
            error = new AppError(ErrorCodes.REQUEST.INVALID_JSON);
        }
        // Multer errors
        else if (err.name === 'MulterError') {
            const errorDef = err.code === 'LIMIT_FILE_SIZE'
                ? ErrorCodes.REQUEST.FILE_TOO_LARGE
                : ErrorCodes.REQUEST.FILE_UPLOAD_ERROR;
            error = new AppError(errorDef);
        }
        // Legacy error codes from services (backward compatibility)
        else if (err.code && typeof err.code === 'string' && legacyErrorMap[err.code]) {
            error = convertLegacyError(err);
        }
        // Unknown errors
        else {
            error = new AppError(ErrorCodes.SERVER.INTERNAL);
        }
    }

    // Logging
    const statusCode = error.statusCode || 500;
    logData.code = error.code;

    if (statusCode >= 500) {
        logger.error('Server Error', { ...logData, statusCode });
    } else {
        logger.warn('Client Error', { ...logData, statusCode });
    }

    // Response
    const response = {
        success: false,
        error: {
            code: error.code,
            message: error.message
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl
    };

    // Include details if present
    if (error.details) {
        response.error.details = error.details;
    }

    // Include stack in development
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

module.exports = errorHandler;
