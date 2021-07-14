const AppError = require('../utils/appError');

const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    errName: err.name,
    errCode: err.code,
    error: err,
    errStack: err.stack,
  });
};

const sendProdError = (err, res) => {
  if (err.isOperational) {
    // console.log(err);
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    //Unknown Errors
    console.log(err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  const keys = Object.keys(err.keyValue);
  const message = `${keys[0]}: ${err.keyValue[keys[0]]} already exists`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const ind = err.message.indexOf('failed: ') + 'failed: '.length;
  const message = `Invalid input data. ${err.message.substring(ind)}`;
  return new AppError(message, 400);
};
const handleJWTError = (err) => {
  return new AppError('Invalid token. Please log in again', 401);
};
const handleJWTExpiredError = (err) => {
  return new AppError('Token expired. Please log in again', 401);
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  let error = { ...err };
  error.name = err.name;
  error.message = err.message;
  error.status = err.status;
  error.statusCode = err.statusCode;
  console.log(err);
  console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV == 'development') {
    console.log('hi there from dev error');
    sendDevError(err, res);
  } else if (process.env.NODE_ENV == 'production') {
    console.log('hi there from prod error');

    // if (error.name === 'CastError') error = handleCastErrorDB(error);
    // if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    // if (error.name === 'ValidationError')
    //   error = handleValidationErrorDB(error);

    // if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    // if (error.name === 'TokenExpiredError')
    //   error = handleJWTExpiredError(error);
    sendProdError(error, res);
  }
};
