const {logger} = require('./logger');

const errorHandler = (err, req, res, next) => {
    let error = {...err};
    error.message = err.message;

    const errorData = {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        error: err.message,
        stack: err.stack
    }

    if (err.name === 'CastError') {
        const message = `Resource not found`;
        error = {message, statusCode: 404};
    }

    if (err.code === 11000) {
        const message = `Duplicate field value entered:`;
        error = {message, statusCode: 400};
    }

    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = {message, statusCode: 400};
    }

    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token. Please log in again.';
        error = {message, statusCode: 401};
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Your token has expired. Please log in again.';
        error = {message, statusCode: 401};
    }

    if (err.name === 'SyntaxError' && err.status === 400 && 'body' in err) {
        const message = 'Invalid JSON payload.';
        error = {message, statusCode: 400};
    }

    if (err.name === 'MulterError') {
        let message = 'File upload error.';
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'File size exceeds the allowed limit.';
        }
        error = {message, statusCode: 400};
    }

    const statusCode = error.statusCode || 500;

    if (statusCode >= 500) {
        logger.error('Server Error', {...errorData, statusCode});
    } else {
        logger.warn('Client Error', {...errorData, statusCode});
    }

    res.status(statusCode).json({
        success: false,
        error: error.message || 'Server Error',
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        ...(process.env.NODE_ENV === 'development' && {stack: err.stack, details: error})
    });
}

module.exports = errorHandler;