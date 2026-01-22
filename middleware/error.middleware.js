// Custom error class
export class ApiError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}


// Error handler for async functions
export const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

// second way of writing catchAsync
 export const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error))
    }

}

// Handle JWT errors
export const handleJWTError = () => 
    new ApiError('Invalid token. Please log in again!', 401);

export const handleJWTExpiredError = () => 
    new ApiError('Your token has expired! Please log in again.', 401);





