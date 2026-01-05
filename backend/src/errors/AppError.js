/**
 * Custom application error class with hierarchical error codes
 */
class AppError extends Error {
    /**
     * @param {Object} errorDef - Error definition from ErrorCodes { code, message, statusCode }
     * @param {Object} [options] - Additional options
     * @param {string} [options.message] - Override default message
     * @param {*} [options.details] - Additional error details
     */
    constructor(errorDef, options = {}) {
        const message = options.message || errorDef.message;
        super(message);

        this.name = 'AppError';
        this.code = errorDef.code;
        this.statusCode = errorDef.statusCode;
        this.details = options.details || null;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            code: this.code,
            message: this.message,
            ...(this.details && { details: this.details })
        };
    }
}

module.exports = AppError;
