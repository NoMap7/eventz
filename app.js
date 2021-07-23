const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const morgan = require('morgan');
const hpp = require('hpp');
app.use(hpp()); //prevent http parameter pollution

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

//routers
const viewsRouter = require('./routes/viewsRoutes');
const userRouter = require('./routes/userRoutes');
const postRouter = require('./routes/postRoutes');

// set view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//directory for static files
app.use(
  express.static(path.join(__dirname, 'public'), {
    dotfiles: 'ignore',
    index: false,
    redirect: false,
  })
);

//middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //log requests to the console
}

//routes
app.use('/', viewsRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/users', userRouter);

//undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`${req.originalUrl} was not found `, 404));
});

//global error handling middleware
app.use(globalErrorHandler);
module.exports = app;
