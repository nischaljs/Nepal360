"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAsync = exports.errorHandler = exports.ApiError = void 0;
const zod_1 = require("zod");
class ApiError extends Error {
    constructor(statusCode, message, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.ApiError = ApiError;
const errorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = 'An unexpected error occurred';
    let errors = undefined;
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err instanceof zod_1.ZodError) {
        statusCode = 400;
        message = 'Validation error';
        errors = err.issues.map(error => error.message);
    }
    else {
        console.error('UNEXPECTED ERROR:', err);
    }
    res.status(statusCode).json(Object.assign(Object.assign({ success: false, message }, (errors && { errors })), (process.env.NODE_ENV === 'development' && { stack: err.stack })));
};
exports.errorHandler = errorHandler;
const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(err => next(err));
};
exports.catchAsync = catchAsync;
