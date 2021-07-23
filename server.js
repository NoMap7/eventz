const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

//this should be at top, so it starts listening for error from the begining
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION Shutting down application');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((c) => {
    console.log('connected to database successfully');
    // .catch((err) => {    //handling these errors below in global unhandledRejection
    //     console.log(err);
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Listening to requests on port: ${port}`);
  console.log(`${process.env.NODE_ENV} mode`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION Shutting down application');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
