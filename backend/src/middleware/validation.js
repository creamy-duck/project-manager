const { body, param, query, validationResult } = require('express-validator');
const { AppError, ErrorCodes } = require('../errors');

/**
 * Maps express-validator errors to specific error codes
 * Key format: "context.field.validatorName"
 */
const validationErrorMap = {
    // Login validations
    'login.email.isEmail': ErrorCodes.VALIDATION.LOGIN.EMAIL_INVALID,
    'login.email.notEmpty': ErrorCodes.VALIDATION.LOGIN.EMAIL_REQUIRED,
    'login.password.notEmpty': ErrorCodes.VALIDATION.LOGIN.PASSWORD_REQUIRED,

    // Register validations
    'register.email.isEmail': ErrorCodes.VALIDATION.REGISTER.EMAIL_INVALID,
    'register.email.notEmpty': ErrorCodes.VALIDATION.REGISTER.EMAIL_REQUIRED,
    'register.password.notEmpty': ErrorCodes.VALIDATION.REGISTER.PASSWORD_REQUIRED,
    'register.password.isLength': ErrorCodes.VALIDATION.REGISTER.PASSWORD_TOO_SHORT,
    'register.password.matches': ErrorCodes.VALIDATION.REGISTER.PASSWORD_WEAK,
    'register.username.notEmpty': ErrorCodes.VALIDATION.REGISTER.USERNAME_REQUIRED,
    'register.username.isLength': ErrorCodes.VALIDATION.REGISTER.USERNAME_LENGTH,
    'register.username.matches': ErrorCodes.VALIDATION.REGISTER.USERNAME_FORMAT,

    // User validations
    'user.id.isMongoId': ErrorCodes.VALIDATION.USER.ID_INVALID,
    'user.id.isLength': ErrorCodes.VALIDATION.USER.ID_INVALID,
    'user.email.isEmail': ErrorCodes.VALIDATION.USER.EMAIL_INVALID,
    'user.name.notEmpty': ErrorCodes.VALIDATION.USER.NAME_REQUIRED,
    'user.name.isLength': ErrorCodes.VALIDATION.USER.NAME_LENGTH
};

/**
 * Creates a validation error handler for a specific context
 * @param {string} context - e.g., 'login', 'register', 'user'
 */
const createValidationHandler = (context) => (req, res, next) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        return next();
    }

    const errorArray = errors.array();
    const firstError = errorArray[0];

    // Try to find specific mapped error
    // Format: context.field.validatorType
    const mapKey = `${context}.${firstError.path}.${firstError.type}`;
    const errorDef = validationErrorMap[mapKey] || ErrorCodes.VALIDATION.FAILED;

    // Collect all validation errors as details
    const details = errorArray.map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
    }));

    throw new AppError(errorDef, { details });
};

const validateLogin = [
    body('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    createValidationHandler('login')
];

const validateRegister = [
    body('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),
    createValidationHandler('register')
];

const validateIdParam = [
    param('id')
        .isLength({ min: 1 })
        .withMessage('Invalid ID format'),
    createValidationHandler('user')
];

module.exports = {
    createValidationHandler,
    validateRegister,
    validateLogin,
    validateIdParam
};
